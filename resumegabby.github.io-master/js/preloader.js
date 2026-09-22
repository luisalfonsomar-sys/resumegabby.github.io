$(function () {
      setTimeout(function () {
            $("#preload").addClass("out");
      }, 5000);
      setTimeout(function () {
            $("#preload").remove();
      }, 6000);
});