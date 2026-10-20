if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Times New Roman', Times, serif";
}

let projectionChartInstance = null;

function initChart(labels, directWealthData) {
    const canvas = document.getElementById('projectionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (projectionChartInstance) {
        projectionChartInstance.destroy();
    }

    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Times New Roman', Times, serif";
    }

    projectionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Direct Accumulated Wealth (₹)',
                    data: directWealthData,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.12)',
                    borderWidth: 3,
                    pointBackgroundColor: '#4f46e5',
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatInrCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age Timeline (Years)'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.04)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Net Savings & Wealth in Rupees (₹)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000000) return '₹' + (value / 10000000).toFixed(2) + ' Cr';
                            if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + ' L';
                            if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'k';
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.04)'
                    }
                }
            }
        }
    });
}

function formatInrCurrency(amount) {
    if (amount >= 10000000) {
        return '₹' + (amount / 10000000).toFixed(2) + ' Crore';
    } else if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(2) + ' Lakh';
    }
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}