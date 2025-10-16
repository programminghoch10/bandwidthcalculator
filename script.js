
const magnitudeletters = " KMGT"
const timeframes = [
  ["s", 1, "seconds"],
  ["m", 60, "minutes"],
  ["h", 60 * 60, "hours"],
  ["d", 60 * 60 * 24, "days"],
  ["W", 60 * 60 * 7, "weeks"],
  ["M", 60 * 60 * 30.5, "months"],
  ["Y", 60 * 60 * 24 * 365.25, "years"],
]
function getTimeframe(string) {
  return timeframes.find(t => t[0] === string)[1]
}

// round to specified amount of decimal places, undefined to disable rounding
const DECIMAL_PLACES_OUTPUT = 3
const DECIMAL_PLACES_INPUT = undefined

const magnitudes = []
magnitudeletters.split("").forEach((m, i) => {
  magnitudes.push(
    [m + "bit", Math.pow(1000, i)],
    [m + "B", Math.pow(1000, i) * 8],
    [m + "iB", Math.pow(1024, i) * 8]
  )
})
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
  { size: 4.7, magnitude: getMagnitude("GB") },
]

Math.roundpl = function (number, places) {
  const factor = Math.pow(10, places)
  return Math.round(number * factor) / factor
}

HTMLParagraphElement.prototype.setOutputNumber = function (number, suffix) {
  suffix ??= ""
  if (suffix) suffix = " " + suffix
  // round number
  if (DECIMAL_PLACES_OUTPUT)
    number = Math.roundpl(number, DECIMAL_PLACES_OUTPUT)
  this.innerText = number + suffix
}

HTMLInputElement.prototype.setInputNumber = function (number) {
  if (DECIMAL_PLACES_INPUT)
    number = Math.roundpl(number, DECIMAL_PLACES_INPUT)
  this.value = number
}

HTMLElement.prototype.setNumber = function (number) {
  if (this instanceof HTMLInputElement)
    return this.setInputNumber(...arguments)
  if (this instanceof HTMLParagraphElement)
    return this.setOutputNumber(...arguments)
  console.error("no submatch for setNumber found", this)
  this.innerText = number
}

function populateSelections(element, allowemptytimeframe) {
  const magnitudeSelect = element.querySelector(".magnitude")
  magnitudes.forEach(magnitude => {
    const option = document.createElement("option")
    option.innerText = magnitude[0]
    option.value = magnitude[1]
    magnitudeSelect.appendChild(option)
  })

  allowemptytimeframe ??= false
  const timeframeselect = element.querySelector(".timeframe")
  if (allowemptytimeframe) {
    const option = document.createElement("option")
    timeframeselect.appendChild(option)
  }
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
  config = config ?? {}
  const inputline = inputlinetemplate.content.cloneNode(true)
  populateSelections(inputline)
  if (config.speed)
    inputline.querySelector("input[name=speed]").value = config.speed
  inputline.querySelector("select[name=magnitude]").value = config.magnitude ?? getMagnitude("MB")
  inputline.querySelector("select[name=timeframe]").value = config.timeframe ?? getTimeframe("s")
  inputdiv.appendChild(inputline)
}
defaultinputlines.forEach(config => createInputLine(config))
document.querySelector(".inputline > input[name=speed]").focus()

const outputlinetemplate = document.querySelector("template#outputline")
const outputdiv = document.querySelector("div#output")
function createOutputLine(config) {
  config = config ?? {}
  const outputline = outputlinetemplate.content.cloneNode(true)
  populateSelections(outputline, true)
  outputline.querySelector("input[name=size]").value = config.size ?? 1
  outputline.querySelector("select[name=magnitude]").value = config.magnitude ?? getMagnitude("MB")
  outputline.querySelector("select[name=timeframe]").value = config.timeframe ?? ""
  outputdiv.appendChild(outputline)
}
defaultoutputlines.forEach(config => createOutputLine(config))
oninput()


document.querySelectorAll(
  ".inputline > input, .inputline > select, .outputline > input, .outputline > select"
).forEach(input => input.oninput = oninput)
var lastUsedTextInputLineField = undefined
function oninput(e) {
  let inputline
  if (e) {
    let target = e.target
    inputline = target.parentElement
    if (inputline.classList.contains("inputline")) {
      if (target instanceof HTMLInputElement)
        lastUsedTextInputLineField = target
      else
        target = lastUsedTextInputLineField ?? target
      highlightReferenceInput(target)
      inputline = target.parentElement
    } else {
      inputline = selectAnyOtherInputline()
    }
  } else {
    inputline = selectAnyOtherInputline()
  }
  calculate(inputline)
}

function selectAnyOtherInputline(inputline) {
  if (lastUsedTextInputLineField)
    return lastUsedTextInputLineField.parentElement
  let inputlines = [...document.querySelectorAll(".inputline")]
  inputlines = inputlines.filter(il => il != inputline)
  return inputlines[0] ?? inputline
}

document.addEventListener("keydown", (event) => {
  const key = event.key
  if (key == "Escape") {
    event.preventDefault()
    lastUsedTextInputLineField = undefined
    highlightReferenceInput()
  }
})

function highlightReferenceInput(input) {
  document.querySelectorAll("input.reference")
    .forEach(e => e.classList.remove("reference"))
  if (input)
    input.classList.add("reference")
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
      inputspeed / (outputmagnitude / inputmagnitude) * (outputtimeframe / inputtimeframe)
  })
  document.querySelectorAll(".outputline").forEach(outputline => {
    const outputsize = outputline.querySelector("input[name=size]").value
    const outputmagnitude = outputline.querySelector("select.magnitude").value
    var outputtimeframe = outputline.querySelector("select.timeframe").value
    if (outputtimeframe == "") {
      const outputwithouttimeframe = (outputsize * outputmagnitude) / ((inputspeed * inputmagnitude) / inputtimeframe)
      const outputtimeframe = timeframes
        .sort((a, b) => b[1] - a[1])
        .map(timeframe => [timeframe, outputwithouttimeframe / timeframe[1]])
        .reduce((a, b) => {
          if (Math.floor(a[1]) == 0) return b
          if (Math.floor(b[1]) == 0) return a
          return Math.floor(a[1]) < Math.floor(b[1]) ? a : b
        })[0]
      outputline.querySelector(".duration").setOutputNumber(outputwithouttimeframe / outputtimeframe[1], outputtimeframe[2])
      return
    }
    outputline.querySelector(".duration").setNumber(
      (outputsize * outputmagnitude) / ((inputspeed * inputmagnitude) / inputtimeframe) / outputtimeframe
    )
  })
}
