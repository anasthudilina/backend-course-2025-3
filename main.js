const { program } = require('commander');
const fs = require('fs');

// Налаштування параметрів командного рядка
program
  .requiredOption('-i, --input <path>', 'path to input file')
  .option('-o, --output <path>', 'path to output file')
  .option('-d, --display', 'display result in console')
  .option('-c, --cylinders', 'show cylinders count')
  .option('-m, --mpg <number>', 'filter: mpg below specified value')
  // Кастомна обробка помилок для відповідності методичці
  .configureOutput({
    writeErr: (str) => {
      if (str.includes("required option '-i, --input <path>' not specified")) {
        process.stderr.write("Please, specify input file\n");
      } else {
        process.stderr.write(str);
      }
    }
  });

program.parse(process.argv);
const options = program.opts();

// Перевірка на існування файлу (якщо шлях вказано, але файлу немає)
if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

try {
  // Читання даних за допомогою readFileSync
  const rawData = fs.readFileSync(options.input, 'utf-8');
  
  // Парсинг JSON (обробка кожного рядка як окремого об'єкта)
  const data = rawData
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));

  // Логіка фільтрації за параметром -m (паливна економність)
  let filteredData = data;
  if (options.mpg) {
    const limit = parseFloat(options.mpg);
    filteredData = filteredData.filter(car => car.mpg < limit);
  }

  // Формування результату (Варіант 5)
  const resultLines = filteredData.map(car => {
    let line = car.model;
    
    // Якщо задано параметр -c, додаємо кількість циліндрів
    if (options.cylinders) {
      line += ` ${car.cyl}`;
    }
    
    // Додаємо паливну економність (mpg)
    line += ` ${car.mpg}`;
    return line;
  });

  const finalResult = resultLines.join('\n');

  // Вивід у консоль за наявності параметра -d
  if (options.display) {
    console.log(finalResult);
  }

  // Запис у файл за наявності параметра -o (через writeFileSync)
  if (options.output) {
    fs.writeFileSync(options.output, finalResult, 'utf-8');
  }

} catch (err) {
  // Обробка непередбачуваних помилок (наприклад, битий JSON)
  process.exit(1);
}