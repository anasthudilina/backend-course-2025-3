const { program } = require('commander');
const fs = require('fs');

program
  .requiredOption('-i, --input <path>', 'path to input file')
  .option('-o, --output <path>', 'path to output file')
  .option('-d, --display', 'display result in console')
  .option('-c, --cylinders', 'show cylinders count')
  .option('-m, --mpg <number>', 'filter: mpg below specified value');

program.parse(process.argv);
const options = program.opts();

if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1);
}

if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

try {
  const rawData = fs.readFileSync(options.input, 'utf-8');
  const data = rawData.trim().split('\n').map(line => JSON.parse(line));

  let filteredData = data;
  if (options.mpg) {
    const limit = parseFloat(options.mpg);
    filteredData = filteredData.filter(car => car.mpg < limit);
  }

  const resultLines = filteredData.map(car => {
    let line = car.model;
    if (options.cylinders) {
      line += ` ${car.cyl}`;
    }
    line += ` ${car.mpg}`;
    return line;
  });

  const finalResult = resultLines.join('\n');

  if (options.display) {
    console.log(finalResult);
  }

  if (options.output) {
    fs.writeFileSync(options.output, finalResult, 'utf-8');
  }
} catch (err) {
  process.exit(1);
}