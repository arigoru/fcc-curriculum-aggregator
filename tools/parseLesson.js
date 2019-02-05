// we should input markdown of an lesson into file
// we should output JSON of an lesson
// working with streams in js reference: https://github.com/substack/stream-handbook

var Transform = require('stream').Transform;

var parser = new Transform({ objectMode: true });

let descriptionEnd = "</section>";
descriptionEnd = descriptionEnd.split('').map((_, i) => descriptionEnd.charCodeAt(i));

function checkForEnd(compareTo, data, index) {
  let tempData = data.slice(index, index + compareTo.length);
  for (let j = 0; j < compareTo.length; j++)
    if (compareTo[j] != tempData[j]) return false;
  // console.log(tempData,compareTo)
  return true;
}

parser._transform = function (data, encoding, done) {
  let headerDone = false;
  let descriptionDone = false;
  let firstSkipped = false;
  let header = "", content = "";
  let i = 0;
  // skip first 3 dashes
  for (; ((i < data.length) && (!firstSkipped)); i++)
    if ((data[i] === 45) && (data[i + 1] === 45) && (data[i + 2] === 45))
      firstSkipped = true;
  i += 2;
  for (; ((i < data.length) && (!headerDone)); i++) {
    if ((data[i] === 45) && (data[i + 1] === 45) && (data[i + 2] === 45)) {
      // detected ---, header done
      // console.log("header done at: ", i);
      headerDone = true;
    } else {
      header = header.concat(String.fromCharCode(data[i]));
    }
  }
  for (; ((i < data.length) && (!descriptionDone)); i++) {
    if (checkForEnd(descriptionEnd, data, i)) {
      // we are done
      descriptionDone = true;
    } else {
      content = content.concat(String.fromCharCode(data[i]));
    }
  }
  this.push(parseData(header, content).concat("\n"));
  done();
};
// Pipe the streams
process.stdin
  .pipe(parser)
  .pipe(process.stdout);
process.stdout.on('error', process.exit);

function parseData(header, content) {
  let lesson = parseHeader(header);
  lesson.content = parseContent(content);
  return `"${lesson.id}" : `.concat(JSON.stringify(lesson)).concat('\n');
}
function parseHeader(header) {
  let lesson = {
    id: "",
    title: "",
    videoUrl: ""
  }
  header = header.trim().split(/\r?\n/).map(e => e.split(': ').map(e => e.trim()));
  // console.log(header)
  header.forEach(
    e => {
      switch (e[0]) {
        case "id":
          lesson.id = e[1];
          break;
        case "title":
          lesson.title = e[1];
          break;
        case "videoUrl":
          lesson.videoUrl = e[1];
          break;
      }
    }
  )
  return lesson;
}
let contentStart = "<section id='description'>";
function parseContent(content) {
  content = content.slice(content.search(contentStart) + contentStart.length);
  return content;
}