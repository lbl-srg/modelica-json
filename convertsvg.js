const svgToImg = require("svg-to-img");
const { readFileSync } = require('fs');

const svg = readFileSync('docx/img/FromModelica.Modulation.svg', 'utf-8');

(async () => {
  const image = await svgToImg.from(svg).toPng({
    encoding: "base64"
  });

  console.log(image);
})();
