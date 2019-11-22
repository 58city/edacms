angular.module('directives').directive('ndDatepicker',['$filter','$timeout',function($filter,$timeout){
    return {
        restrict:'E',
        scope:{
            date:'=',
            hour:'=',
            minute:'=',
            disabled:'='
        },
        template:'<div class="input-group date form-group">'+
                    '<input ng-model="date" ng-disabled="disabled" class="form-control"'+
                    'id="inputDate" type="text" name="date" placeholder="点击选择日期" readonly>'+
                    '<span class="input-group-btn">'+
                        '<button class="btn btn-default" type="button">'+
                            '<i class="fa fa-calendar"></i>'+
                        '</button>'+
                    '</span>'+
                 '</div>'+
                 '<div class="row">'+
                    '<div class="col-md-6">'+
                        '<div class="form-group">'+
                            '<label class="sr-only" for="hour">Email address</label>'+
                            '<select ng-model="hour" ng-disabled="disabled" class="form-control" id="hour">'+
                                '<option value="00">00 时</option>'+
                                '<option value="01">01 时</option>'+
                                '<option value="02">02 时</option>'+
                                '<option value="03">03 时</option>'+
                                '<option value="04">04 时</option>'+
                                '<option value="05">05 时</option>'+
                                '<option value="06">06 时</option>'+
                                '<option value="07">07 时</option>'+
                                '<option value="08">08 时</option>'+
                                '<option value="09">09 时</option>'+
                                '<option value="10">10 时</option>'+
                                '<option value="11">11 时</option>'+
                                '<option value="12">12 时</option>'+
                                '<option value="13">13 时</option>'+
                                '<option value="14">14 时</option>'+
                                '<option value="15">15 时</option>'+
                                '<option value="16">16 时</option>'+
                                '<option value="17">17 时</option>'+
                                '<option value="18">18 时</option>'+
                                '<option value="19">19 时</option>'+
                                '<option value="20">20 时</option>'+
                                '<option value="21">21 时</option>'+
                                '<option value="22">22 时</option>'+
                                '<option value="23">23 时</option>'+
                            '</select>'+
                        '</div>'+
                    '</div>'+
                    '<div class="col-md-6">'+
                        '<div class="form-group">'+
                        '<label class="sr-only" for="minute">Email address</label>'+
                            '<select ng-model="minute" ng-disabled="disabled" class="form-control" id="minute">'+
                                '<option value="00">00 分</option>'+
                                '<option value="01">01 分</option>'+
                                '<option value="02">02 分</option>'+
                                '<option value="03">03 分</option>'+
                                '<option value="04">04 分</option>'+
                                '<option value="05">05 分</option>'+
                                '<option value="06">06 分</option>'+
                                '<option value="07">07 分</option>'+
                                '<option value="08">08 分</option>'+
                                '<option value="09">09 分</option>'+
                                '<option value="10">10 分</option>'+
                                '<option value="11">11 分</option>'+
                                '<option value="12">12 分</option>'+
                                '<option value="13">13 分</option>'+
                                '<option value="14">14 分</option>'+
                                '<option value="15">15 分</option>'+
                                '<option value="16">16 分</option>'+
                                '<option value="17">17 分</option>'+
                                '<option value="18">18 分</option>'+
                                '<option value="19">19 分</option>'+
                                '<option value="20">20 分</option>'+
                                '<option value="21">21 分</option>'+
                                '<option value="22">22 分</option>'+
                                '<option value="23">23 分</option>'+
                                '<option value="24">24 分</option>'+
                                '<option value="25">25 分</option>'+
                                '<option value="26">26 分</option>'+
                                '<option value="27">27 分</option>'+
                                '<option value="28">28 分</option>'+
                                '<option value="29">29 分</option>'+
                                '<option value="30">30 分</option>'+
                                '<option value="31">31 分</option>'+
                                '<option value="32">32 分</option>'+
                                '<option value="33">33 分</option>'+
                                '<option value="34">34 分</option>'+
                                '<option value="35">35 分</option>'+
                                '<option value="36">36 分</option>'+
                                '<option value="37">37 分</option>'+
                                '<option value="38">38 分</option>'+
                                '<option value="39">39 分</option>'+
                                '<option value="40">40 分</option>'+
                                '<option value="41">41 分</option>'+
                                '<option value="42">42 分</option>'+
                                '<option value="43">43 分</option>'+
                                '<option value="13">13 分</option>'+
                                '<option value="44">44 分</option>'+
                                '<option value="45">45 分</option>'+
                                '<option value="46">46 分</option>'+
                                '<option value="47">47 分</option>'+
                                '<option value="48">48 分</option>'+
                                '<option value="49">49 分</option>'+
                                '<option value="50">50 分</option>'+
                                '<option value="51">51 分</option>'+
                                '<option value="52">52 分</option>'+
                                '<option value="53">53 分</option>'+
                                '<option value="54">54 分</option>'+
                                '<option value="55">55 分</option>'+
                                '<option value="56">56 分</option>'+
                                '<option value="57">57 分</option>'+
                                '<option value="58">58 分</option>'+
                                '<option value="59">59 分</option>'+
                            '</select>'+
                        '</div>'+
                    '</div>'+
                '</div>',
        link:function(scope,element){
            $(element.find('.date')).datepicker({
                format: 'yyyy年mm月dd日',
                startDate:new Date(),
                todayBtn: "linked",
                language: "zh-CN",
                autoclose: true,
                todayHighlight: true
            });
        }
    }
}])