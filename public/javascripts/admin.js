$(function () {
  //拿到所有的删除按钮，并得出当前按下的删除target
  $('.del').click(function (e) {
    var id = $(e.target).data('id') //就是list.jade中对应的每个的item._id
    var tr = $('.item-id-' + id) //对应这个id的一整行内容（由class名获取）

    $.ajax({
        type: 'DELETE',
        url: '/pole?id=' + id
      })
      .done(function (results) {
        if (results.success === 1) {
          if (tr.length > 0) {
            tr.remove();
          }
        }
      });
  });
});