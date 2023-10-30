
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
//TODO: remove "iB" from magnitudes, its the same as B

document.querySelectorAll(".magnitude").forEach(element => {
  magnitudes.forEach(magnitude => {
    const option = document.createElement("option")
    option.innerText = magnitude[0]
    option.value = magnitude[1]
    element.appendChild(option)
  })
  if (element.getAttribute("default")) {
    element.value = magnitudes.find(m => m[0] === element.getAttribute("default"))[1]
  }
})

document.querySelectorAll(".timeframe").forEach(element =>
  timeframes.forEach(timeframe => {
    const option = document.createElement("option")
    option.innerText = timeframe[0]
    option.value = timeframe[1]
    element.appendChild(option)
  })
)

document.querySelectorAll(
  ".inputline > input, .inputline > select, .outputline > input, .outputline > select"
).forEach(input => input.oninput = oninput)
function oninput(e) {
  let target = e.target
  let inputline = target.parentElement
  if (target != inputline.querySelector("input[name=speed]"))
    inputline = selectAnyOtherInputline(inputline)
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
    const outputmagnitude = outputline.querySelector("select.magnitude").value
    const outputtimeframe = outputline.querySelector("select.timeframe").value
    outputline.querySelector("input[name=speed]").value =
      inputspeed * inputmagnitude * inputtimeframe / outputmagnitude / outputtimeframe
  })
  document.querySelectorAll(".outputline").forEach(outputline => {
    const outputsize = outputline.querySelector("input[name=size]").value
    const outputmagnitude = outputline.querySelector("select.magnitude").value
    const outputtimeframe = outputline.querySelector("select.timeframe").value
    outputline.querySelector(".duration").innerText =
      (outputsize * outputmagnitude) / (inputspeed * inputmagnitude * inputtimeframe) / outputtimeframe
  })
}
