// pages/partner/personal/data/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    avatar: '',
    num: 0,
    partner_level:'',
    // phone:'17483728432',
    // teamName: '少年闰土',
    is_band_partner:0,  //标识是否有上级合伙人
    spread_user_phone: '',
    spread_user_nickname: '',
    showMask:false,
    inputPhone:"",
    inputName:"",
    addTeamId:null //要加入团队id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const user = app.globalData.userInfo
    app.http.get('/api/partner/index').then(data => {
      // console.log(user)
      if (data) {
        this.setData({
          num: data.member_nums,
          name: this.cut(user.nickName),
          avatar: user.avatarUrl,
          is_band_partner:user.is_band_partner,
          partner_level:user.partner_level
        })
        if(this.data.is_band_partner === 1){
          this.setData({
            spread_user_nickname:user.spread_user_nickname,
            spread_user_phone:user.spread_user_phone,
          })
        }
      }
    })
  },
  to: function (e) {
    const data = e.currentTarget.dataset
    const url = data.url
    wx.navigateTo({ url })
  },
  cut(str, len = 15) {
    if (str.length > len) {
      return str.substr(0, len)
    } else {
      return str
    }
  },
  // wxapi打开电话
  openPhone(){
    wx.makePhoneCall({phoneNumber:this.data.spread_user_phone})
  },
  //切换显示mask
  tabMask(){
    this.setData({ showMask: !this.data.showMask })
  },
  //添加团队
  addTeam(){
    // wx.showToast({})
    this.tabMask()
  },
  //监听输入框
  Transfusion(event){
    this.setData({ inputPhone: event.detail.value})
  },
  //下一步
  async next(){
    var res = await app.http.post('/api/partner/partner/searchPartner',{phone:this.data.inputPhone})
    if(res.nickname === undefined){
      wx.showToast({
        icon:'none',
        title:'用户不存在，请修改后再试',
        image:'/assets/image/red_close.png'
      })
      return
    }
    this.setData({inputName:res.nickname,addTeamId:res.uid})
    var that = this;
    wx.showModal({
      title: '提示',
      content: `是否确定加入${this.data.inputName}的团队？`,
      success: async (res) =>{
        if (res.confirm) {
          // 加入成功
          const res = await app.http.post('/api/partner.index/joinTeam',{spid:this.data.addTeamId})
          console.log(res)
          console.log(that.data.addTeamId)
          wx.showToast({
            title:'加入成功',
          })
          this.setData({
            is_band_partner:1,  //标识是否有上级合伙人
            spread_user_phone: res.phone,
            spread_user_nickname: res.nickname,
          })
          that.tabMask()
          // 加入失败
          // wx.showToast({
          //   icon:'none',
          //   title:'加入失败，请稍后再试',
          //   image:'/assets/image/red_close.png'
          // })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
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