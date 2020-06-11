// pages/detail/Light/grating-characteristics/grating-characteristics.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputList:[{
      label:'谱线的平均波长 λ= ',
      value:546.1,
      unit:"𝑛𝑚",
      id:'lambda_0'
    },
    {
      label:'仪器不确定度= ',
      value:1,
      unit:"分",
      id:'uncertainty_yi'
    }],
    //记录表
    // table:[
    //   ['',"𝜽𝘈","𝜽𝘉","𝜽𝘈'","𝜽𝘉'","𝛗"],
    //   ['黄1光',0,0,0,0,'#'],
    //   ['黄2光',0,0,0,0,'#'],
    //   ["绿光1",0,0,0,0,'#'],
    //   ["绿光2",0,0,0,0,'#'],
    //   ['绿光3',0,0,0,0,'#'],
    // ],
    table:[
      ['',"𝜽𝘈","𝜽𝘉","𝜽𝘈'","𝜽𝘉'","𝛗"],
      ['黄1光',260.35,80.35,240.42,60.39,'#'],
      ['黄2光',260.31,80.31,240.45,60.41,'#'],
      ["绿光1",260.0,80,241.18,61.14,'#'],
      ["绿光2",260.01,80.02,241.19,61.16,'#'],
      ['绿光3',259.55,79.54,240.22,62.19,'#'],
    ],

    //其他数据
    uncertainty_yi_rad:0.000214,  //仪器不确定度  rad 
    //中间数据
    phi_aver:0,  //绿光的平均phi
    d1:0,       //绿光的d(lambda/sinphi)
    d2:0,       //绿光的d(lambda/sinphi)
    d3:0,       //绿光的d(lambda/sinphi)
    d_aver:0,   //绿光的d
    d_delta:0,  // 绿光的d误差
    //结果
    E_relative:0,   //相对不确定度
    //黄光
    lambda_y_1:0,   //黄光1 波长
    lambda_y_2:0,   //黄光2 波长

  },


  /**
   * 数据监听
   */
  changeData(e){
    let value = e.detail.value, id = e.currentTarget.id
    // console.log(e.currentTarget)
    console.log('来自'+id+'的数据试图写入：')
    if(value === ''){
      console.log('\t写入失败')
      return false
    }

    if(id == "table")
    {
      let row = e.currentTarget.dataset.row, col = e.currentTarget.dataset.col
      let table = this.data.table
      this.setData({
        [`table[${row}][${col}]`]:value,
      })
      console.log(`\t成功在表[${row}][${col}]处写入 `+value)
    }
    else if(id === "lambda_0"){
      this.setData({
        ['inputList[0].value']: value
      })
      
      console.log(`\t成功写入lambda_0 `+this.data.inputList[0].value)
    }
    else if(id === "uncertainty_yi"){
      this.setData({
        ['inputList[1].value']: value
      })
      var tmp = value * 0.000214
      tmp = tmp.toFixed(6)
      this.setData({
        ['uncertainty_yi_rad']: tmp
      })
      console.log(`\t成功写入uncertainty_yi `+this.data.inputList[1].value)
      console.log(`\t成功写入uncertainty_yi_rad`+this.data.uncertainty_yi_rad)
    }
},




   /**
   * 计算
   */
    calculate(){
        console.log("开始计算!")
        let lambda_0 = this.data.inputList[0].value //nm
        let u_yi = this.data.uncertainty_yi_rad //rad

        let table = this.data.table

        let phi_aver = 0
        let d1 = 0, d2 = 0, d3 = 0
        let d_aver = 0
        let d_delta = 0
        let E_relative = 0

        let lambda_y_1 = 0
        let lambda_y_2 = 0

        let isResult=false

        //处理表格
        for(var i=1;i<6;i++){
          if (Number(table[i][1])&&Number(table[i][2])&&Number(table[i][3])&&Number(table[i][4])) {
            let t1_rad = this.data2rad(table[i][1])
            let t2_rad = this.data2rad(table[i][2])
            let t3_rad = this.data2rad(table[i][3])
            let t4_rad = this.data2rad(table[i][4])
            //计算求和
            var phi_tmp = Number((Math.abs(t1_rad-t3_rad)+Math.abs(t4_rad-t2_rad)) / 4)
            if (i>2) {
              phi_aver = Number(phi_tmp.toFixed(4)) + Number(phi_aver)
              console.log("求和"+phi_aver)
              if (i===3){
                d1 = Number(lambda_0/Math.sin(phi_tmp*Math.PI/180)).toFixed(2)
                console.log("d1刚出炉"+d1)
              }
              if (i===4){
                d2 = Number(lambda_0/Math.sin(phi_tmp*Math.PI/180)).toFixed(2)
                console.log("d2刚出炉"+d2)
              }
              if (i===5){
                d3 = Number(lambda_0/Math.sin(phi_tmp*Math.PI/180)).toFixed(2)
                console.log("d3刚出炉"+d3)
              }
            }
            //结果入表
            phi_tmp = (Number( this.rad2data(phi_tmp) )).toFixed(2)
            table[i][5] = Number(phi_tmp)
            // var phi_str = this.rad2str(table[i][5])
            this.setData({[`table[${i}][5]`]:table[i][5]})
            console.log("\t表格第"+i+"行已更新"+this.data.table[i][5])
          }
          else{
            this.setData({['isResult']:isResult})
            return
          }
        }
        console.log("表格处理完毕:")
        console.log(table)
        console.log("xianzai:"+phi_aver)
        //一般数据处理
        phi_aver = (Number(phi_aver/3)).toFixed(2)    //rad
        console.log("phi_aver处理完毕rad:"+phi_aver)
        d_aver = (Number(d1)+Number(d2)+Number(d3))/3
        d_aver = Number(d_aver).toFixed(2)  //nm
        console.log("d_aver处理完毕nm:"+d_aver)
        var db = Number(Number(u_yi) / Math.tan(phi_aver*Math.PI/180))
        var da = this.Sx(Number(d1),Number(d2),Number(d3))
        console.log(da+'!'+da)
        d_delta = Number(Math.sqrt(da*da+db*db)).toFixed(2)
        E_relative = (d_delta/d_aver).toFixed(4)
        console.log("E_relative处理完毕:"+E_relative)
        console.log("d_delta处理完毕nm:"+d_delta)
        

        //黄光
        let phi1_y_rad = this.data2rad(Number(table[1][5]))
        let phi2_y_rad = this.data2rad(Number(table[2][5]))
        console.log("y1"+phi1_y_rad+'@'+Math.sin(phi1_y_rad*Math.PI/180))
        console.log("y2"+phi2_y_rad+'@'+Math.sin(phi2_y_rad*Math.PI/180))
        var sin1 = Math.sin(phi1_y_rad*Math.PI/180)
        var sin2 = Math.sin(phi2_y_rad*Math.PI/180)
        lambda_y_1 = d_aver * Math.sin(phi1_y_rad*Math.PI/180)
        lambda_y_2 = d_aver * Math.sin(phi2_y_rad*Math.PI/180)
        console.log("y1l"+lambda_y_1)
        console.log("y2l"+lambda_y_2)
        //更新数据
        //phi rad
        phi_tmp = Number(this.rad2data(phi_aver)).toFixed(2)
        var phi_str = this.rad2str(phi_tmp)
        this.setData({["phi_aver"]:phi_str})
        console.log("phi_aver 已更新:"+this.data.phi_aver)
        //todo: 字符串
        //d 
        d1 = (Number(d1/1000)).toFixed(2)   //mm
        this.setData({["d1"]:d1})
        console.log("d1 已更新(mm):"+this.data.d1)
        d2 = (Number(d2/1000)).toFixed(2)   //mm
        this.setData({["d2"]:d2})
        console.log("d2 已更新:"+this.data.d2)
        d3 = (Number(d3/1000)).toFixed(2)   //mm
        this.setData({["d3"]:d3})
        console.log("d3 已更新:"+this.data.d3)
        d_aver = (Number(d_aver/1000)).toFixed(2)   //mm
        this.setData({["d_aver"]:d_aver})
        console.log("d_aver 已更新:"+this.data.d_aver)
        d_delta = (Number(d_delta)).toFixed(1)   //mm
        this.setData({["d_delta"]:d_delta})
        console.log("d_delta 已更新:"+this.data.d_delta)
        //相对误差
        var E_relative_tmp = (E_relative*100).toFixed(2)
        this.setData({["E_relative"]:E_relative_tmp})
        console.log("E_relative 已更新:"+this.data.E_relative)
        //黄光波长
        lambda_y_1 = lambda_y_1.toFixed(2)
        this.setData({["lambda_y_1"]:lambda_y_1})   
        console.log("lambda_y_1 已更新:"+this.data.lambda_y_1)  //nm

        lambda_y_2 = lambda_y_2.toFixed(2)
        this.setData({["lambda_y_2"]:lambda_y_2})
        console.log("lambda_y_2 已更新:"+this.data.lambda_y_2)  //nm

        this.setData({["isResult"]:true})
        console.log("计算完毕!")
  },



   /**
   * 角度转换
   */
  
   data2rad(n){
      n = Number(n)
      var z = n.toFixed(0)
      var x =0+ n-z
      if(x<0){
        z -= 1
        x += 1
      }
      // console.log('z'+z+'x'+x)
      var re = Number(Number(z) + x / 0.6)
      re = re.toFixed(4)
      console.log("\t已将伪度数:"+n+" 转换为rad:"+re)
      return re 
   },

   rad2data(n){
    n = Number(n)
    var z = n.toFixed(0)
    var x = n-z
    if(x<0){
      z -= 1
      x += 1
    }
    // console.log(z+'@'+x)
    var re = Number(Number(z) +x* 0.6)
    re = re.toFixed(4)
    console.log("\t已将rad:"+n+" 转换为伪度数:"+re)
    return re 
 },

 rad2str(n){
  n = Number(n)
  console.log(n)
  // n = n.toFixed(2)
  var z = n.toFixed(0)
  var x = (n-z)
  if(x<0){
    z -= 1
    x += 1
  }
  z = Number(z).toFixed(0)
  x = Number(x*100).toFixed(0)
  var re = z +'°'+x+"'"
  return re
 },


 Sx(){
  var n = arguments.length
  //算数平均数
  var total = 0;
  for (var i = 0; i < n; i = i + 1) {
      total = total + arguments[i];
  }
  var avernum = total/arguments.length
  console.log("\t\t正在标准差计算:平均数计算完毕:"+avernum)
  //标准偏差
  var s = 0
  for(var i=0;i<n;i++)
  {
    s += (arguments[i]-avernum)*(arguments[i]-avernum);
  }
  s = Math.sqrt(s/(n-1))
  console.log("\t\t正在标准差计算:标准偏差计算完毕:"+s)
  //A类不确定度
  var sx = s/Math.sqrt(n)
  console.log("\t\t正在标准差计算:A类不确定度:"+sx)
  return sx
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})