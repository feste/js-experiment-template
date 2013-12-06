function caps(a) {return a.substring(0,1).toUpperCase() + a.substring(1,a.length);}
function uniform(a, b) { return ( (Math.random()*(b-a))+a ); }
function showSlide(id) { $(".slide").hide(); $("#"+id).show(); }
function shuffle(v) { newarray = v.slice(0);for(var j, x, i = newarray.length; i; j = parseInt(Math.random() * i), x = newarray[--i], newarray[i] = newarray[j], newarray[j] = x);return newarray;} // non-destructive.

var nQs = 3;

$(document).ready(function() {
  showSlide("consent");
  $("#mustaccept").hide();
});

var experiment = {
  data: {},
  
  instructions: function() {
    if (turk.previewMode) {
      $("#instructions #mustaccept").show();
    } else {
      showSlide("instructions");
      $("#begin").click(function() { experiment.trial(0); })
    }
  },
  
  trial: function(qNumber) {
    $('.bar').css('width', ( (qNumber / nQs)*100 + "%"));
    var trialData = {};
    $(".err").hide();

    //*******General Slider Stuff**************
    var nResponses = 0;
    trialData["responses"] = [];
    function changeCreator(i) {
      return function(value) {
        $('#slider' + i).css({"background":"#99D6EB"});
        $('#slider' + i + ' .ui-slider-handle').css({
          "background":"#667D94",
          "border-color": "#001F29" });
        if (trialData.responses[i] == null) {
          nResponses++;
        }
        var sliderVal = $("#slider"+i).slider("value");
        trialData.responses[i] = sliderVal;
        $("#slider" + i + "val").html(sliderVal);
      } 
    }
    function slideCreator(i) {
      return function() {
        $('#slider' + i + ' .ui-slider-handle').css({
           "background":"#E0F5FF",
           "border-color": "#001F29"
        });
      }
    }
    //********************************************

    if (qNumber == 0) {
      //Vertical Sliders for Probability Bins*******
      showSlide("binsTrial");
      var nBins = 10;
      var responseNeeded = function() {
        console.log(nResponses);
        console.log(nBins);
        return nResponses < nBins;
      }
      var binWidth = 10;
      var firstColWidth = 150;
      var otherColWidth = 100;

      var lowers = [];
      var uppers = [];
      var sliders = "";
      var ranges = "";

      for (var i=0; i<nBins; i++) {
        sliders += '<td rowspan="5" width="' + otherColWidth + '" align="center"><div class="slider" id="slider' + i + '"></div></td>';
        //uncomment if unbounded
        //if (i<(nBins-1)) {
          var low = i*binWidth;
          var high = (i+1)*binWidth;
          lowers.push(low);
          uppers.push(high);
          ranges += '<td align="center" width="' + otherColWidth + '">' + low + '-' + high + '</td>';
        //uncomment if unbounded
        //} else {
        //  var low = i*binWidth;
        //  lowers.push(low);
        //  uppers.push("infty");
        //  ranges += '<td align="center" width="' + otherColWidth + '">more than ' + low + '</td>';
        //}
      }
      $("#sliderbins").html('<td height="80" width="' + firstColWidth + '">Extremely Likely</td>' + sliders);
      $("#ranges").html('<td width="' + firstColWidth + '"></td>' + ranges);

      for (var i=0; i<nBins; i++) {
        $("#slider" + i).css({"height": 360, "width":12});
        $("#slider" + i + " .ui-slider-handle").attr({"background": "#FAFAFA"});
        $('#slider' + i).slider({
          animate: true,
          orientation: "vertical",
          max: 100 , min: 0, step: 1, value: 50,
          slide: slideCreator(i),
          change: changeCreator(i)
        });
      }
    } else if (qNumber == 1) {
      //Simple Horizontal Sliders
      showSlide("horizTrial");
      var responseNeeded = function() {
        return nResponses < 2;
      }
      var requiredResponses = 2;
      var slidersHTML = ""
      for (var i=0; i<2; i++) {
        slidersHTML += '<div id="slider' + i + '" class="slider"></div><p id="xy' + i + '">value=<span id="slider' + i + 'val">__</span></p>'
      }
      $("#horizsliders").html(slidersHTML)
      for (var i=0; i<2; i++) {
        $("#slider" + i).css({"height": 10, "width":300});
        $("#slider" + i + " .ui-slider-handle").attr({"background": "#FAFAFA"});
        $('#slider' + i).slider({
          animate: true,
          orientation: "horizontal",
          max: 100 , min: 0, step: 1, value: 50,
          slide: slideCreator(i),
          change: changeCreator(i)
        });
      }
    } else {
      showSlide("priceTrial");
      $("#price").val("");
      var responseNeeded = function() {
        var price = $("#price").val();
        var isPrice = /^[0-9]*(\.[0-9])?[0-9]$/.test(price);
        trialData[["price"]] = price;
        return !isPrice;
      }
    }

    $(".continue").click(function() {
      if (responseNeeded()) {
        $(".err").show();
      } else {
        $(".continue").unbind("click");
        $(".err").hide();
        experiment.data["trial" + qNumber] = trialData;
        if (qNumber + 1 < nQs) {
          experiment.trial(qNumber+1);
        } else {
          experiment.questionaire();
        }
      }
    })
  },
  
  questionaire: function() {
    //disable return key
    $(document).keypress( function(event){
     if (event.which == '13') {
        event.preventDefault();
      }
    });
    //progress bar complete
    $('.bar').css('width', ( "100%"));
    showSlide("questionaire");
    $("#formsubmit").click(function() {
      rawResponse = $("#questionaireform").serialize();
      pieces = rawResponse.split("&");
      var age = pieces[0].split("=")[1];
      var lang = pieces[1].split("=")[1];
      var comments = pieces[2].split("=")[1];
      if (lang.length > 0) {
        experiment.data["language"] = lang;
        experiment.data["comments"] = comments;
        experiment.data["age"] = age;
        showSlide("finished");
        setTimeout(function() { turk.submit(experiment.data) }, 1000);
      }
    });
  }
}
  
