
const magnitudeletters = " KMGT"
const timeframes = [
  ["s", 1],
  ["m", 60],
  ["h", 60 * 60],
  ["d", 60 * 60 * 24],
  ["W", 60 * 60 * 7],
  ["M", 60 * 60 * 30.5],
  ["Y", 60 * 60 * 24 * 365.25],
]
function getTimeframe(string) {
  return timeframes.find(t => t[0] === string)[1]
}

const magnitudes = []
magnitudeletters.split("").forEach((m, i) => {
  magnitudes.push(
    [m + "bit", Math.pow(1000, i)],
    [m + "B", Math.pow(1000, i) * 8],
    [m + "iB", Math.pow(1024, i) * 8]
  )
});
function getMagnitude(string) {
  return magnitudes.find(m => m[0] === string)[1]
}
//TODO: remove "iB" from magnitudes, its the same as B

const defaultinputlines = [
  { speed: 100, magnitude: getMagnitude("Mbit"), timeframe: getTimeframe("s") },
  { magnitude: getMagnitude("MB"), timeframe: getTimeframe("s") },
  { magnitude: getMagnitude("GB"), timeframe: getTimeframe("h") },
]
const defaultoutputlines = [
  { size: 1, magnitude: getMagnitude("GB"), timeframe: getTimeframe("s") },
  { size: 700, magnitude: getMagnitude("MB"), timeframe: getTimeframe("s") },
  { size: 4.7, magnitude: getMagnitude("GB"), timeframe: getTimeframe("s") },
]

function populateSelections(element) {
  const magnitudeSelect = element.querySelector(".magnitude")
  magnitudes.forEach(magnitude => {
    const option = document.createElement("option")
    option.innerText = magnitude[0]
    option.value = magnitude[1]
    magnitudeSelect.appendChild(option)
  })

  const timeframeselect = element.querySelector(".timeframe")
  timeframes.forEach(timeframe => {
    const option = document.createElement("option")
    option.innerText = timeframe[0]
    option.value = timeframe[1]
    timeframeselect.appendChild(option)
  })
}

const inputlinetemplate = document.querySelector("template#inputline")
const inputdiv = document.querySelector("div#input")
function createInputLine(config) {
  const inputline = inputlinetemplate.content.cloneNode(true)
  populateSelections(inputline)
  if (config.speed)
    inputline.querySelector("input[name=speed]").value = config.speed
  inputline.querySelector("select[name=magnitude]").value = config.magnitude ?? getMagnitude("MB")
  inputline.querySelector("select[name=timeframe]").value = config.timeframe ?? getTimeframe("s")
  inputdiv.appendChild(inputline)
}
defaultinputlines.forEach(config => createInputLine(config))

const outputlinetemplate = document.querySelector("template#outputline")
const outputdiv = document.querySelector("div#output")
function createOutputLine(config) {
  const outputline = outputlinetemplate.content.cloneNode(true)
  populateSelections(outputline)
  outputline.querySelector("input[name=size]").value = config.size ?? 1
  outputline.querySelector("select[name=magnitude]").value = config.magnitude ?? getMagnitude("MB")
  outputline.querySelector("select[name=timeframe]").value = config.timeframe ?? getTimeframe("s")
  outputdiv.appendChild(outputline)
}
defaultoutputlines.forEach(config => createOutputLine(config))
oninput()


document.querySelectorAll(
  ".inputline > input, .inputline > select, .outputline > input, .outputline > select"
).forEach(input => input.oninput = oninput)
function oninput(e) {
  let inputline
  if (e) {
    let target = e.target
    inputline = target.parentElement
    if (target != inputline.querySelector("input[name=speed]"))
      inputline = selectAnyOtherInputline(inputline)
  } else {
    inputline = selectAnyOtherInputline()
  }
  calculate(inputline)
}

function selectAnyOtherInputline(inputline) {
  let inputlines = [...document.querySelectorAll(".inputline")]
  inputlines = inputlines.filter(il => il != inputline)
  return inputlines[0] ?? inputline
}

function calculate(origin) {
  const inputspeed = origin.querySelector("input[name=speed]").value
  const inputmagnitude = origin.querySelector("select.magnitude").value
  const inputtimeframe = origin.querySelector("select.timeframe").value
  document.querySelectorAll(".inputline").forEach(outputline => {
    if (outputline === origin) return
    const outputmagnitude = outputline.querySelector("select.magnitude").value
    const outputtimeframe = outputline.querySelector("select.timeframe").value
    outputline.querySelector("input[name=speed]").value =
      (inputspeed * inputmagnitude * inputtimeframe) / (outputmagnitude * outputtimeframe)
  })
  document.querySelectorAll(".outputline").forEach(outputline => {
    const outputsize = outputline.querySelector("input[name=size]").value
    const outputmagnitude = outputline.querySelector("select.magnitude").value
    const outputtimeframe = outputline.querySelector("select.timeframe").value
    outputline.querySelector(".duration").innerText =
      (outputsize * outputmagnitude) / ((inputspeed * inputmagnitude) / inputtimeframe) / outputtimeframe
  })
}
