// ilé investor deck as PowerPoint: each slide is the rendered PDF page, full bleed,
// with that slide's text in the speaker notes. Rebuild the PDF first, then:
//   node scripts/build-ile-pptx.js <dir of s-NN.png and nN.txt>
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const dir = process.argv[2];
const out = path.resolve(__dirname, "..", "docs", "Ile - Investor Presentation.pptx");
const pres = new pptxgen();
pres.defineLayout({ name: "A4L", width: 11.69, height: 8.27 });
pres.layout = "A4L";
pres.title = "Ilé, investor presentation";
pres.author = "Ilé";
const pngs = fs.readdirSync(dir).filter(f => /^s-\d+\.png$/.test(f)).sort();
pngs.forEach((f, i) => {
  const slide = pres.addSlide();
  slide.addImage({ path: path.join(dir, f), x: 0, y: 0, w: 11.69, h: 8.27,
                   altText: "Ilé investor presentation, slide " + (i + 1) });
  const notes = path.join(dir, "n" + (i + 1) + ".txt");
  if (fs.existsSync(notes)) {
    slide.addNotes(fs.readFileSync(notes, "utf8").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim());
  }
});
pres.writeFile({ fileName: out }).then(f => console.log(f, pngs.length, "slides"));
