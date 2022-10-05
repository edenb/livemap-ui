// Based on : https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
// Color names: https://www.w3schools.com/colors/colors_names.asp

export function standardizeColor(str) {
  var ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = str;
  return ctx.fillStyle;
}
