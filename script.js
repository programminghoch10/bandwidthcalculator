
const magnitudeletters = " KMGT"
const timeframes = [
  ["s", 1],
  ["m", 60],
  ["h", 60 * 60],
]

const magnitudes = []
magnitudeletters.split("").forEach((m, i) => {
  magnitudes.push(
    [m + "bit", Math.pow(1000, i)],
    [m + "B", Math.pow(1000, i) * 8],
    [m + "iB", Math.pow(1024, i) * 8]
  )
});

document.querySelectorAll(".magnitude").forEach(element =>
  magnitudes.forEach(magnitude => {
    const option = document.createElement("option")
    option.innerText = magnitude[0]
    option.value = magnitude[1]
    element.appendChild(option)
  })
)

document.querySelectorAll(".timeframe").forEach(element =>
  timeframes.forEach(timeframe => {
    const option = document.createElement("option")
    option.innerText = timeframe[0]
    option.value = timeframe[1]
    element.appendChild(option)
  })
)

const inputnumberfield = document.querySelector("#input > input[name=speed]")
const inputmagnitudefield = document.querySelector("#input > select.magnitude")
const inputtimeframefield = document.querySelector("#input > select.timeframe")
const outputnumberfield = document.querySelector("#output > input[name=speed]")
const outputmagnitudefield = document.querySelector("#output > select.magnitude")
const outputtimeframefield = document.querySelector("#output > select.timeframe")


inputnumberfield.oninput = calculate
inputmagnitudefield.oninput = calculate
inputtimeframefield.oninput = calculate
outputmagnitudefield.oninput = calculate
outputtimeframefield.oninput = calculate
function calculate() {
  console.log("calculate")
  const inputspeed = inputnumberfield.value
  const inputmagnitude = inputmagnitudefield.value
  const inputtimeframe = inputtimeframefield.value
  const outputmagnitude = outputmagnitudefield.value
  const outputtimeframe = outputtimeframefield.value
  outputnumberfield.value =
    inputspeed / inputmagnitude / inputtimeframe * outputmagnitude * outputtimeframe
}
