$(function() {
  $("#spinner-balance").hide();
  $("#spinner").hide();
  $("#result").hide();
  $("#error").hide();

  $('#balance_submit').click(function() {
    $("#spinner-balance").show();
    checkBalance();
  });

  $('#submit').click(function() {
    $("#spinner").show();
    $('#submit').prop('disabled', true);
    transacPoints();
  });

  function checkBalance(){
    const walletAddress = $('#balance_walletAddress').val();
    const balance_pointsType = $("input[name='balance_pointsType']:checked").val();
    const typePoints = ['Cash','Loyal']
    $.ajax({
      url: "/balance",
      type: 'GET',
      data: { 
        walletAddress: walletAddress,
        type: balance_pointsType
       },
      dataType: 'json',
      success: function(res) {
        $('#balance-modal').modal('show')
        $('#balance').html(res.balances);
        $('#type').html(typePoints[balance_pointsType])
        $("#spinner-balance").hide();
      },
      error: function(xhr, status, error) {
        $('#balance-modal').modal('show')
        $('#status').append(`
        <div class="alert alert-danger" role="alert">
          ${status}
        </div>
        `);
      },
    });
  }

  function transacPoints(){
    const walletAddress = $('#walletAddress').val();
    const amount = $('#pointsAmount').val();
    const pointsType = $("input[name='pointType']:checked").val();
    const type = $("input[name='txType']:checked").val();
    const txType = ['new','use']
    $.ajax({
      url: "/points",
      type: 'POST',
      data: { 
        address: walletAddress,
        amount: amount,
        type: pointsType,
        txType: txType[type],
       },
      dataType: 'json',
      success: function(res) {
        $("#spinner").hide();
        $('#submit').prop('disabled', false);
        $("#result").show();
        var jsonStr = JSON.stringify(res);
        $("#data-result").html(jsonStr);
        console.log(res)
      },
      error: function(xhr, status, error) {
        $("#error").show();
        $("#data-error").html(error);
        console.log(error)
      },
    });
  }
});