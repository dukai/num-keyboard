define(function(require, module, exports){
	var $ = require('jquery');
  var _ = require('dtools');


  $('.input').click(function(){
    
  });


  var CustomPassword = function(options){
    this._initCustomPassword(options);
  }


  CustomPassword.prototype = {
    _initCustomPassword: function(options){
      this.options = _.mix({
        ele: '.input'
      },options);
      this.panel = $(this.options.ele);

      this._initUI();
      this._initEvents();
      this.length = 0;
      this.values = [];
    },
    _initUI: function(){},
    _initEvents: function(){
      var self = this;
      this.panel.click(function(){
        $('.num-keyboard').show();
      });


      $('.num-keyboard').on('click', 'div[data-value]', function(){
        console.log(this.dataset.value);
        if(this.dataset.value == 'del'){
          if(self.length == 0){
            return;
          }
          self.values.unshift();
          self.panel.find('div').eq(self.length - 1).removeClass('active');
          self.length--;
        }else if(this.dataset.value == 'done'){
          $('.num-keyboard').hide();
        }else{
          self.values.push(this.dataset.value);
          self.length++;
          self.panel.find('div').eq(self.length - 1).addClass('active');
        }
      });
    }

  }

  new CustomPassword();
})
