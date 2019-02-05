$(docReady);
const JSONURLS = {
  meta: "https://arigoru.github.io/fcc-curriculum-aggregator/json/meta.json",
  1: "https://arigoru.github.io/fcc-curriculum-aggregator/json/1.json",
  2: "https://arigoru.github.io/fcc-curriculum-aggregator/json/2.json",
  3: "https://arigoru.github.io/fcc-curriculum-aggregator/json/3.json",
  4: "https://arigoru.github.io/fcc-curriculum-aggregator/json/4.json",
  5: "https://arigoru.github.io/fcc-curriculum-aggregator/json/5.json",
  6: "https://arigoru.github.io/fcc-curriculum-aggregator/json/6.json"
}
let $loading = $("<div>");
const loadingAnimation = {
  play: function () {
    $("#main-body").append($loading)
    $loading.addClass("loadingAnimation").attr("id", "loadingAnimation");
    $loading.append("<h1>Loading, please wait...</h1>");
    $loading.animate({ opacity: 1 }, 2000);
  },
  stop: function () {
    $loading.animate({ opacity: 1 }, 100, () => {
      $loading.animate({ opacity: 0 }, 2000, () => {
        $loading.remove();
      });
    })
  }
}

function docReady(e) {
  loadingAnimation.play();
  getJSON(JSONURLS.meta).then(() => {
    parseMeta();
    getJSON(JSONURLS[1]).then(() => {
      getJSON(JSONURLS[2]).then(() => {
        getJSON(JSONURLS[3]).then(() => {
          getJSON(JSONURLS[4]).then(() => {
            getJSON(JSONURLS[5]).then(() => {
              getJSON(JSONURLS[6]).then(() => {
                renderLessonsToPage(); // assumes that curriculum is now proper array of meta
                updateEventHandlers();
                loadingAnimation.stop();
                processHashAnchor();
              })
            })
          })
        })
      })
    })
  });
  updateEventHandlers();
  currentLessons = $(`h4[id^='slide-${currentIndex}']`);
}

function processHashAnchor() {
  let hash = location.hash.slice(1);
  if (/\d-\d+-\d+/.test(hash)) {
    $(`#nav-side-${hash}`).click();
    scrollNavigation(hash);
  } else if (/[1-7]/.test(hash)) {
    $(`#nav-section-title-${hash}`).click();
  } else {
    $(`#nav-section-title-7`).click();
  }
}

let scrollTimeout; const scrollInterval = 1000;
function updateEventHandlers() {
  $(".nav-section-title, .nav-drop-element, .lesson-link").click(navigationClicked);
  $(".scrimba").click(showVideoClick);
  $(window).resize(function () {
    $(`#nav-section-title-${currentIndex}`).click();
  });
  $(".slide-content").scroll(function () {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      scrollTimeout = null;
    }
    scrollTimeout = setTimeout(scrollHandler, scrollInterval);
  });
  $(".slide-content blockquote, .slide-content code").mousedown(copyCodeHandler);
}

function filterMeta(dashedName) {
  return function (element) {
    return element.superBlock === dashedName;
  }
}

var curriculum;

function parseMeta() {
  // get initial sceleton of array
  curriculum = [
    {
      slideId: 1,
      title: "Responsive Web Design",
      meta: unparsedData.curriculumMetaRaw.filter(filterMeta("responsive-web-design")),
    },
    {
      slideId: 2,
      title: "Javascript Algorithms And Data Structures",
      meta: unparsedData.curriculumMetaRaw.filter(filterMeta("javascript-algorithms-and-data-structures"))
    },
    {
      slideId: 3,
      title: "Front End Libraries",
      meta: unparsedData.curriculumMetaRaw.filter(filterMeta("front-end-libraries"))
    },
    {
      slideId: 4,
      title: "Data Visualization",
      meta: unparsedData.curriculumMetaRaw.filter(filterMeta("data-visualization"))
    },
    {
      slideId: 5,
      title: "Apis And Microservices",
      meta: unparsedData.curriculumMetaRaw.filter(filterMeta("apis-and-microservices"))
    },
    {
      slideId: 6,
      title: "Information Security And Quality Assurance",
      meta: unparsedData.curriculumMetaRaw.filter(filterMeta("information-security-and-quality-assurance"))
    },
  ]

  curriculum.forEach(e => {
    e.meta.sort((a, b) => (a.order - b.order));
  });
}
let unparsedData;
let currentJSON = 0;
function getJSON(url) {
  return $.ajax({
    headers: {
      Accept: "application/json"
    },
    url: url,
    success: function (jsonData) {
      switch (currentJSON) {
        case 0:
          if (typeof jsonData === "string") {
            unparsedData = JSON.parse(jsonData);
          } else { unparsedData = jsonData; }
          break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
          if (typeof jsonData === "string") {
            curriculum[currentJSON - 1].lessons = JSON.parse(jsonData)[`lessons-${currentJSON}`];
          } else {
            curriculum[currentJSON - 1].lessons = jsonData[`lessons-${currentJSON}`];
          }
          break;
      }
      currentJSON++;
    }
  });
}

function copyCodeHandler(event) {
  if (event.which === 1) {
    copy($(this));
    var $tool = $("<div>");
    $(this).append($tool);
    $tool.html("Copied to clipboard!")
      .addClass("codeTooltip")
      .delay(2000).queue(function (next) {
        $(this).remove();
        next()
      });
  }
}

function copy(target) {
  var $temp = $("<div>");
  $("body").append($temp);
  $temp.attr("contenteditable", true)
    .html(target.html()).select()
    .on("focus", function () { document.execCommand('selectAll', false, null) })
    .focus();
  document.execCommand("copy");
  $temp.remove();
}

function scrollHandler(event) {
  if (currentIndex !== 7) {
    let id = getClosestAnchor().attr("id");
    id = id.slice(id.indexOf("-") + 1);
    location.href = "#".concat(id);
    scrollNavigation(id);
    $(`#location-indicator-${currentIndex}`).animate(
      {
        top: $(`#nav-side-${id}`).position().top + $(`#nav-side-${currentIndex}`).scrollTop(),
        height: $(`#nav-side-${id}`).parent().height()
      }, 2000);
  } else {
    location.href = "#7";
  }

}

function showVideoClick(event) {
  if ($(this).attr("data-status") === "display") {
    // hide video
    $(this).text("Show video")
      .attr("data-status", "hidden")
      .next().remove();
  } else {
    // show video
    $(this).text("Hide video")
      .attr("data-status", "display")
      .after(renderVideo($(this).attr("data-video")));
  }
}

function renderLessonsToPage() {
  for (let i = 0; i < curriculum.length; i++) {
    // add slide title
    let currentSlide = $(`#slide-${i + 1}`);
    let currentNav = $(`#nav-side-${i + 1}`);
    let currentMenu = $(`#nav-section-dropdown-${i + 1}`);
    currentSlide.html(renderSlideTitle(i + 1, curriculum[i].title));
    // renderSideNav
    currentNav.html(renderSideNav(curriculum[i].title, i + 1));
    // roll over all sections
    curriculum[i].meta.forEach((section, j) => {
      currentSlide.append(renderSectionTitle(i + 1, j + 1, section.name));
      currentMenu.append(renderSectionMenuItem(i + 1, j + 1, section.name));
      currentNav.append(renderSideSectionName(section.name,i+1,j+1));
      var $temp = $("<ul>");
      currentNav.append($temp);
      // roll over all lessons
      section.challengeOrder.forEach((subSection, z) => {
        $temp.append(renderLessonLink(subSection[1],i+1,j+1,z+1));
        currentSlide.append(renderSubSectionTitle(i + 1, j + 1, z + 1, subSection[1]));
        let lessonUrl = makeLessonUrl(section.superBlock, section.dashedName,
          subSection[1].toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\-a-zA-Z0-9]+/g, '')
        );
        currentSlide.append(renderLessonUrl(lessonUrl, subSection[1]));
        if (curriculum[i].lessons[subSection[0]].videoUrl.length > 5) currentSlide.append(renderVideoButton(curriculum[i].lessons[subSection[0]].videoUrl));
        currentSlide.append("<section>" + curriculum[i].lessons[subSection[0]].content + "</section>");
      });
    });
  }

}

const makeLessonUrl = (category,section,lesson) => {
  return `https://learn.freecodecamp.org/${category}/${section}/${lesson}/`;
}

const renderLessonLink = (title,slide,section,lesson) =>{
  return `<li><a class="lesson-link" id="nav-side-${slide}-${section}-${lesson}" href="#" data-slide-id="${slide}" data-section="${section}" data-lesson="${lesson}">${title}</a></li>`;
}

const renderSideNav = (title, index) => {
  return `<h4>${title}</h2><div id="location-indicator-${index}" class="location-indicator"></div>`;
}
const renderSideSectionName = (name,slide,section)=>{
  return `<h5 id="nav-side-${slide}-${section}">${name}</h5>\n`;
}
const renderVideo = (url) => `<iframe class="scrimba-video" frameborder="0" src=${url}></iframe>`;

const renderLessonUrl = (url, title) => {
  return `<a href="${url}" target="_blank"><button class="btn section-button">Link to original lesson</button></a>`;
}

const renderVideoButton = (url) => {
  return `<button class="btn scrimba section-button" data-video="${url}">Show video</button>`
}

const renderSlideTitle = (id, title) => {
  return `<h2 id="slide-${id}-0">${title}</h2>`;
}

const renderSectionTitle = (slideId, sectionId, title) => {
  return `<h3 id="slide-${slideId}-${sectionId}">${title}</h3>`;
}

const renderSectionMenuItem = (slideId, sectionId, title) => {
  return `<li class="nav-drop-element" data-section="${sectionId}">${title}</li>`;
}


const renderSubSectionTitle = (slideId, sectionId, subSectionId, title) => {
  return `<h4 id="slide-${slideId}-${sectionId}-${subSectionId}">${title}</h4>`;
}


function getClosestAnchor() {
  let closest = currentLessons.eq(0).position().top;
  let tInd = 0;
  for (let i = 1; i < currentLessons.length; i++) {
    if (currentLessons.eq(i).position().top > 100) {
      tInd = i - 1;
      break;
    }
  }
  return currentLessons.eq(tInd);
}

function changeHue(hue) {
  $("body").get(0).style.setProperty("--baseHue", `${hue}`);
}
function changeSaturation(saturation) {
  $("body").get(0).style.setProperty("--saturation", `${saturation}`);
}
function navigationClicked(event) {
  event.preventDefault();
  if ($(this).attr("data-slide-id") === "0") {
    switch ($(this).attr("data-action")) {
      case "1":
        changeHue(100);
        break;
      case "2":
        changeHue(200);
        break;
      case "3":
        changeHue(Math.floor(Math.random() * 360));
        changeSaturation(Math.floor(Math.random() * 3));
        break;
      case "4":
        changeHue(300);
        break;
      case "5":
        changeSaturation(0);
        break;
      case "6":
        changeSaturation(2);
        break;
      case "7":
        changeSaturation(1);
        break;
      case "8":
        changeSaturation(3);
        break;
      default:
        changeHue(Math.floor(Math.random() * 360));
        break;
    }
    return false;
  }
  let id = 0, section = 0, lesson = 0;
  if ($(this).attr("data-lesson") != undefined) {
    id = Number($(this).attr("data-slide-id"));
    section = Number($(this).attr("data-section"));
    lesson = Number($(this).attr("data-lesson"));
    scrollToLesson(id, section, lesson);
  } else if ($(this).attr("data-section") != undefined) {
    id = Number($(this).parent().attr("data-slide-id"));
    section = $(this).attr("data-section");
    scrollToLesson(id, section);
  } else {
    id = Number($(this).attr("data-slide-id"));
    scrollToLesson(id);
  }
  return false;
}

const navBarHeight = 30;
let currentIndex = 1;     // current slide shown
let currentLessons;

function scrollToLesson(slide, section = 0, lesson = 0) {
  let slideTarget = `#slide-${slide}`;
  if (section != 0) {
    slideTarget += `-${section}`;
    if (lesson != 0) slideTarget += `-${lesson}`;

    $(`#slide-${slide}`).stop().animate({
      scrollTop: $(slideTarget)
        .offset().top - navBarHeight + $(`#slide-${slide}`).scrollTop()
    }, 2000);
  }
  $(`#nav-section-title-${currentIndex}`).removeClass("nav-section-current");
  currentIndex = slide;
  $(`#nav-section-title-${currentIndex}`).addClass("nav-section-current");
  currentLessons = $(`h4[id^='slide-${currentIndex}']`);
  let transformX = $("#all-slides-container").width();
  transformX *= slide - 1; transformX /= 7;
  $("#all-slides-container").css("transform", `translateX(calc((-100% * ${slide - 1}) / 7))`);
  // $("#all-slides-container").css("transform", `translateX(-${transformX}px)`);
  // make sure horizontal scroll stays on 0
  // $('html').scrollLeft(0);
  // $('html').stop().animate({scrollLeft: transformX}, 2000);
  return false;
}
function scrollNavigation(target) {
  $(`#nav-side-${currentIndex}`).stop().animate({
    scrollTop: $(`#nav-side-${target}`)
      .offset().top - navBarHeight * 3 + $(`#nav-side-${currentIndex}`).scrollTop()
  }, 2000);
}