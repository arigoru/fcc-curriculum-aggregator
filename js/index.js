// TODO:
// - theme switcher
// - content to cheatsheets switcher

$(docReady);
var scrollTimeout;

function docReady(e) {
  // $(".hidden-radio").change("checked",radioChecked);
  // $(".nav-click").click(scrollToSection);
  // .nav-section-title
  $(".nav-section-title").click(navigationClicked);
  getTestJSON();

  $(".nav-drop-element").click(navigationClicked);
  $(".lesson-link").click(navigationClicked);
  $(".scrimba").click(showVideoClick);
  $(window).resize(function () {
    $(`#nav-section-title-${currentIndex}`).click();
  });
  $(".slide-content").scroll(function () {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      scrollTimeout = null;
    }
    scrollTimeout = setTimeout(scrollHandler, 1000);
  });
  $(".slide-content blockquote,.slide-content code").mousedown(copyCodeHandler);
  // tooltip testst


  // --------------------------------

  currentLessons = $(`h4[id^='slide-${currentIndex}']`);
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
    .attr("data-status","hidden")
    .next().remove();
  } else {
    // show video
    $(this).text("Hide video")
    .attr("data-status","display")
    .after(`<iframe class="scrimba-video" frameborder="0" src=${$(this).attr("data-video")}></iframe>`);
  }
}

function getTestJSON() {
  //   $.getJSON("challenges/rwd.json", function(json) {
  //     console.log(json); // this will show the info it in firebug console
  // });
  console.log(curriculum);
  // roll over all main sections
  for (let i = 0; i < curriculum.length; i++) {
    // add slide title
    let currentSlide = $(`#slide-${i + 1}`);
    let currentNav = $(`#nav-side-${i + 1}`);
    let currentMenu = $(`#nav-section-dropdown-${i + 1}`);
    currentSlide.html(renderSlideTitle(i + 1, curriculum[i].title));
    currentNav.html(`<h4>${curriculum[i].title}</h2><div id="location-indicator-${i + 1}" class="location-indicator"></div>`)
    // roll over all sections
    curriculum[i].meta.forEach((section, j) => {
      currentSlide.append(renderSectionTitle(i + 1, j + 1, section.name));
      currentMenu.append(renderSectionMenuItem(i + 1, j + 1, section.name));
      currentNav.append(`<h5 id="nav-side-${i + 1}-${j + 1}">${section.name}</h5>\n`);
      // temp
      var $temp = $("<ul>");
      currentNav.append($temp);
      // temp
      // roll over all lessons
      section.challengeOrder.forEach((subSection, z) => {
        $temp.append(`<li><a class="lesson-link" id="nav-side-${i + 1}-${j + 1}-${z + 1}" href="#" data-slide-id="${i + 1}" data-section="${j + 1}" data-lesson="${z + 1}">${subSection[1]}</a></li>`);
        currentSlide.append(renderSubSectionTitle(i + 1, j + 1, z + 1, subSection[1]));
        let lessonUrl = `https://learn.freecodecamp.org/${section.superBlock}/${section.dashedName}/${subSection[1].toLowerCase().trim().replace(/\s+/g,'-').replace(/[^\-a-zA-Z0-9]+/g,'')}`;
        currentSlide.append(renderLessonUrl(lessonUrl,subSection[1]));        
        if (curriculum[i].lessons[subSection[0]].videoUrl.length>5) currentSlide.append(renderVideoButton(curriculum[i].lessons[subSection[0]].videoUrl));
        currentSlide.append("<section>" + curriculum[i].lessons[subSection[0]].content + "</section>");
        // curriculum[i].lessons[subSection[0]].videoUrl 
      });
      // currentNav.append(`</ul>`);

    });
  }

}
const renderLessonUrl = (url,title)=>{
  return `<a href="${url}" target="_blank"><button class="btn section-button">Link to original lesson</button></a>`;
} 

const renderVideoButton = (url)=>{
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
  // console.log(closest);
  let tInd = 0;
  for (let i = 1; i < currentLessons.length; i++) {
    // last negative number is what we looking for
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
function changeSaturation(saturation){
  $("body").get(0).style.setProperty("--saturation", `${saturation}`);
}
function navigationClicked(event) {
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
  event.preventDefault();
  // console.log(event);
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
  // cant change focus, will ruin animation on some browsers :(
  // $(`#slide-${id}`).focus();
  return false;
}


function navigationClickedOld(event) {
  event.preventDefault();
  // console.log(event);
  let id = 0, section = 0, lesson = 0;
  if ($(this).attr("data-lesson") != undefined) {
    id = Number($(this).attr("data-slide-id"));
    section = Number($(this).attr("data-section"));
    lesson = Number($(this).attr("data-lesson"));
    $(`#slide-${id}`).stop().animate({
      scrollTop: $(`#slide-${id}-${section}-${lesson}`)
        .offset().top - navBarHeight + $(`#slide-${id}`).scrollTop()
    }, 2000);
  } else if ($(this).attr("data-section") != undefined) {
    id = Number($(this).parent().attr("data-slide-id"));
    section = $(this).attr("data-section");
    $(`#slide-${id}`).stop().animate({
      scrollTop: $(`#slide-${id}-${section}`)
        .offset().top - navBarHeight + $(`#slide-${id}`).scrollTop()
    }, 2000);
  } else {
    id = Number($(this).attr("data-slide-id"));
  }
  $("#all-slides-container").css("transform", `translateX(calc(calc(-100% * ${id - 1}) / 7))`);
  $(`#slide-${id}`).focus();
  return false;
}

const navBarHeight = 30;
let currentIndex = 1;
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
  // console.log(transformX);
  return false;
}
function scrollNavigation(target) {
  $(`#nav-side-${currentIndex}`).stop().animate({
    scrollTop: $(`#nav-side-${target}`)
      .offset().top - navBarHeight * 3 + $(`#nav-side-${currentIndex}`).scrollTop()
  }, 2000);

}