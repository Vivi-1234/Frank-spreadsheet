<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">Dashboard</h2>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <input
            ref="dateRangePicker"
            type="text"
            class="input w-64"
            placeholder="Select date range"
            readonly
          />
        </div>
        <button @click="exportToExcel" class="btn btn-secondary text-sm">
          <Download class="mr-2 h-4 w-4" />
          Export Data
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="panel p-5">
        <p class="text-sm text-gray-400">Total Site Visits</p>
        <p class="text-2xl font-bold text-white">{{ totalStats.visits }}</p>
      </div>
      <div class="panel p-5">
        <p class="text-sm text-gray-400">Total Product Clicks</p>
        <p class="text-2xl font-bold text-white">{{ totalStats.clicks }}</p>
      </div>
      <div class="panel p-5">
        <p class="text-sm text-gray-400">Total Products</p>
        <p class="text-2xl font-bold text-white">{{ totalStats.products }}</p>
      </div>
      <div class="panel p-5">
        <p class="text-sm text-gray-400">Top Product</p>
        <p class="text-lg font-bold truncate text-white" :title="totalStats.topProduct">
          {{ totalStats.topProduct }}
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="panel p-6">
        <h3 class="font-semibold mb-4 text-white">Site Visit Trend</h3>
        <div class="h-64">
          <canvas ref="visitsChart"></canvas>
        </div>
      </div>
      <div class="panel p-6">
        <h3 class="font-semibold mb-4 text-white">Product Click Trend</h3>
        <div class="h-64">
          <canvas ref="clicksChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/config/supabase'
import { Download } from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import * as XLSX from 'xlsx'

Chart.register(...registerables)

const dateRangePicker = ref(null)
const visitsChart = ref(null)
const clicksChart = ref(null)

let flatpickrInstance = null
let visitsChartInstance = null
let clicksChartInstance = null
let currentAnalyticsData = []

const totalStats = ref({
  visits: 0,
  clicks: 0,
  products: 0,
  topProduct: 'N/A'
})

async function loadDashboardData(startDate, endDate) {
  try {
    // Create new Date objects to avoid mutation
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Set to start and end of day in UTC
    start.setUTCHours(0, 0, 0, 0)
    end.setUTCHours(23, 59, 59, 999)
    
    const startStr = start.toISOString()
    const endStr = end.toISOString()
    
    console.log('Loading dashboard data:', { startStr, endStr })

    // Fetch all-time stats for cards
    const [allVisitsRes, allClicksRes, productsRes] = await Promise.all([
      supabase.from('analytics_events').select('*', { count: 'exact' }).eq('event_type', 'site_visit'),
      supabase.from('analytics_events').select('*', { count: 'exact' }).eq('event_type', 'product_click'),
      supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true)
    ])

    // Fetch date-range data for charts - get all data with pagination
    let allRangeData = []
    let fetchedCount = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data: pageData, error: pageError, count: totalCount } = await supabase
        .from('analytics_events')
        .select('event_type, created_at', { count: 'exact' })
        .gte('created_at', startStr)
        .lte('created_at', endStr)
        .range(fetchedCount, fetchedCount + pageSize - 1)
      
      if (pageError) {
        console.error('Error fetching page:', pageError)
        break
      }
      
      if (pageData && pageData.length > 0) {
        allRangeData = allRangeData.concat(pageData)
        fetchedCount += pageData.length
        hasMore = pageData.length === pageSize && fetchedCount < totalCount
        console.log(`Fetched ${fetchedCount} / ${totalCount} records`)
      } else {
        hasMore = false
      }
    }
    
    const rangeData = allRangeData
    const error = null
    
    console.log('Analytics data fetched:', { 
      returned: rangeData?.length,
      startStr, 
      endStr 
    })

    if (error) {
      console.error('Error loading analytics:', error)
      return
    }

    currentAnalyticsData = rangeData || []

    // Calculate stats
    const allClicks = await supabase
      .from('analytics_events')
      .select('event_value')
      .eq('event_type', 'product_click')

    const productClickCounts = (allClicks.data || []).reduce((acc, curr) => {
      if (curr.event_value) {
        acc[curr.event_value] = (acc[curr.event_value] || 0) + 1
      }
      return acc
    }, {})

    const topProduct = Object.keys(productClickCounts).length
      ? Object.entries(productClickCounts).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A'

    totalStats.value = {
      visits: allVisitsRes.count || 0,
      clicks: allClicksRes.count || 0,
      products: productsRes.count || 0,
      topProduct
    }

    // Render charts
    renderCharts(rangeData, startDate, endDate)
  } catch (error) {
    console.error('Error in loadDashboardData:', error)
  }
}

function renderCharts(data, startDate, endDate) {
  const visits = data.filter(e => e.event_type === 'site_visit')
  const clicks = data.filter(e => e.event_type === 'product_click')

  // Generate date labels (using local date to match user's timezone)
  const dateLabels = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0) // Start of day
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999) // End of day
  
  while (current <= end) {
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    dateLabels.push(`${year}-${month}-${day}`)
    current.setDate(current.getDate() + 1)
  }
  
  console.log('Generated date labels:', dateLabels.length, 'days from', dateLabels[0], 'to', dateLabels[dateLabels.length - 1])

  // Process data
  const visitsData = processDataForChart(visits, dateLabels)
  const clicksData = processDataForChart(clicks, dateLabels)

  // Render charts
  renderChart(visitsChart.value, 'line', dateLabels, visitsData, 'Site Visits', '#FFFFFF', 'rgba(255, 255, 255, 0.2)', visitsChartInstance)
  renderChart(clicksChart.value, 'line', dateLabels, clicksData, 'Product Clicks', '#AAAAAA', 'rgba(170, 170, 170, 0.2)', clicksChartInstance)
}

function processDataForChart(events, labels) {
  const dataMap = labels.reduce((acc, label) => {
    acc[label] = 0
    return acc
  }, {})

  events.forEach(event => {
    // Use local date to match the labels (user's timezone)
    const date = new Date(event.created_at)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const eventDate = `${year}-${month}-${day}`
    
    if (dataMap.hasOwnProperty(eventDate)) {
      dataMap[eventDate]++
    } else {
      console.warn('Date not in range:', eventDate, 'Event:', event)
    }
  })
  
  console.log('Processed data map:', dataMap)

  return Object.values(dataMap)
}

function renderChart(canvas, type, labels, data, label, lineColor, bgColor, existingChart) {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (existingChart) {
    existingChart.destroy()
  }

  Chart.defaults.font.family = "'Inter', sans-serif"

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#FFFFFF'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#FFFFFF'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        beginAtZero: true
      }
    }
  }

  const chartData = {
    labels,
    datasets: [{
      label,
      data,
      borderColor: lineColor,
      backgroundColor: bgColor,
      fill: 'start',
      tension: 0.4,
      pointBackgroundColor: lineColor,
      pointBorderColor: '#000',
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2
    }]
  }

  const newChart = new Chart(ctx, {
    type,
    data: chartData,
    options: chartOptions
  })

  if (label === 'Site Visits') {
    visitsChartInstance = newChart
  } else {
    clicksChartInstance = newChart
  }
}

function exportToExcel() {
  if (!currentAnalyticsData || currentAnalyticsData.length === 0) {
    alert('No data to export. Please select a date range.')
    return
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(currentAnalyticsData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics Data')
    XLSX.writeFile(workbook, `analytics_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed: ' + error.message)
  }
}

onMounted(() => {
  // Initialize date picker
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 29)

  flatpickrInstance = flatpickr(dateRangePicker.value, {
    mode: 'range',
    dateFormat: 'Y-m-d',
    defaultDate: [startDate, endDate],
    onChange: (selectedDates) => {
      if (selectedDates.length === 2) {
        loadDashboardData(selectedDates[0], selectedDates[1])
      }
    }
  })

  // Load initial data
  loadDashboardData(startDate, endDate)
})

onBeforeUnmount(() => {
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
  }
  if (visitsChartInstance) {
    visitsChartInstance.destroy()
  }
  if (clicksChartInstance) {
    clicksChartInstance.destroy()
  }
})
</script>

<style scoped>
.panel {
  background-color: #111111;
  border: 1px solid #222222;
  border-radius: 0.75rem;
}

.input {
  border: 1px solid #222222;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #222222;
  color: #FFFFFF;
}

.input:focus {
  outline: none;
  border-color: #FFFFFF;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
}

.btn-secondary {
  background-color: transparent;
  color: #FFFFFF;
  border-color: #222222;
}

.btn-secondary:hover {
  background-color: #111111;
  border-color: #444444;
}
</style>

