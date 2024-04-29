// Monthly sales chart
if ($('#monthlyChart').length) {
  var monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
  var monthlyChart = new Chart(monthlyCtx, {
    type: 'line',
    data: {
      labels: initialLabels, // Use initial labels for the first dataset
      datasets: [{
        label: 'Dataset 1',
        backgroundColor: 'rgba(44, 120, 220, 0.2)',
        borderColor: 'rgba(44, 120, 220)',
        data: initialData
      },
      {
        label: 'Dataset 2',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132)',
        data: [10, 20, 30, 40, 50, 60, 70],
        // Use different labels for the second dataset
        labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7']
      },
      {
        label: 'Dataset 3',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192)',
        data: [5, 15, 25, 35, 45, 55, 65],
        // Use different labels for the third dataset
        labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true
          } 
        }
      }
    }
  });

  // Add click event listener to the legend
  monthlyChart.legend.options.onClick = function(event, legendItem) {
    if (legendItem.text === 'Dataset 2') {
      // Update the chart to show the second dataset
      monthlyChart.data.datasets[0].data = [10, 20, 30, 40, 50, 60, 70];
      monthlyChart.data.labels = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7'];
      monthlyChart.update();
    } else if (legendItem.text === 'Dataset 3') {
      // Update the chart to show the third dataset
      monthlyChart.data.datasets[0].data = [5, 15, 25, 35, 45, 55, 65];
      monthlyChart.data.labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      monthlyChart.update();
    }
  };
}