document.addEventListener('DOMContentLoaded', async () => {
    const fiatSelector = document.getElementById('fiatSelector');
    const convertButton = document.getElementById('convertButton');
    const resultElement = document.getElementById('result');
    const amountInput = document.getElementById('amount');
    let chartInstance;
    
    try {
        const response = await fetch('https://mindicador.cl/api/');
        if (!response.ok) throw new Error('Error al obtener los datos de la API.');
        
        const data = await response.json();
        const monedas = Object.keys(data).filter(key => data[key].unidad_medida === 'Pesos');

        monedas.forEach(moneda => {
            const option = document.createElement('option');
            option.value = moneda;
            option.textContent = data[moneda].nombre;
            fiatSelector.appendChild(option);
        });
    } catch (error) {
        resultElement.textContent = `Error: ${error.message}`;
        return;
    }

    convertButton.addEventListener('click', async () => {
        const clpValue = parseFloat(amountInput.value);
        const currency = fiatSelector.value;

        if (!clpValue || !currency) {
            resultElement.textContent = 'Por favor, ingrese un monto y seleccione una moneda.';
            return;
        }

        try {
            const response = await fetch('https://mindicador.cl/api/');
            if (!response.ok) throw new Error('Error al obtener los datos de la API.');

            const data = await response.json();
            const rate = data[currency].valor;
            const convertedValue = (clpValue / rate).toFixed(2);

            resultElement.textContent = `El valor de ${clpValue} CLP en ${data[currency].nombre} es ${convertedValue}.`;

            const historyResponse = await fetch(`https://mindicador.cl/api/${currency}`);
            if (!historyResponse.ok) throw new Error('Error al obtener el historial de la moneda.');

            const historyData = await historyResponse.json();
            const seriesData = historyData.serie.slice(0, 10).reverse();
            const labels = seriesData.map(day => day.fecha.split('T')[0]);
            const values = seriesData.map(day => day.valor);

            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = document.getElementById('chart').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Historial de 10 días (${data[currency].nombre})`,
                        data: values,
                        borderColor: 'blue',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        fill: false
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                color: 'black'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: 'black'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: 'black'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            resultElement.textContent = `Error: ${error.message}`;
        }
    });
});
