var $copyContainer = $(".copy-container"),
    $replayIcon = $('#cb-replay'),
    $copyWidth = $('.copy-container').find('p').width();

var mySplitText = new SplitText($copyContainer, {type:"words"}),
    splitTextTimeline = new TimelineMax();
var handleTL = new TimelineMax();

// WIP - need to clean up, work on initial state and handle issue with multiple lines on mobile

var tl = new TimelineMax();

tl.add(function(){
  animateCopy();
  blinkHandle();
}, 0.2)

function animateCopy() {
  mySplitText.split({type:"chars, words"}) 
  splitTextTimeline.staggerFrom(mySplitText.chars, 0.001, {autoAlpha:0, ease:Back.easeInOut.config(1.7), onComplete: function(){
    animateHandle()
  }}, 0.05);
}

function blinkHandle() {
  handleTL.fromTo('.handle', 0.4, {autoAlpha:0},{autoAlpha:1, repeat:-1, yoyo:true}, 0);
}

function animateHandle() {
  handleTL.to('.handle', 0.7, {x:$copyWidth, ease:SteppedEase.config(12)}, 0.05);
}

$('#cb-replay').on('click', function(){
  splitTextTimeline.restart()
  handleTL.restart()
})