import Contact from '../../../utils/contactUser/contactUser'
const app = getApp()
let self;
Page({
  data: {
    userInfo: {},
    getinfo: {},
    getnotice: [],
    getProductList: [],
    page: 1,
    limit:10,
    getPartnerInfo: {},
    loading: false, // 加载中
    loaded: false, // 加载完毕
    showModal:false,//是否显示模态框
    coupon_id:0,
    coupon_date:'',
    coupon_price:0,
    pid:0,
    bannerList:[],
  },
  getnotice() {
    app.http.get('/api/customer/mall/getnotice').then(res => {
      this.setData({
        getnotice: res
      })
      // this.getProductList()
      this.getPartnerInfo()
    })
  },
  register() {
    wx.navigateTo({
      url: '/pages/partner/personal/partner/invite?share_id=' + this.data.getPartnerInfo.uid
    })
  },
  getinfo() {
    app.http.get('/api/customer/mall/getinfo').then(res => {
      this.setData({
        getinfo: res
      })
      this.getnotice()
    })
  },
  getProductList() {
    const size = this.data.limit; // 默认一页条数
    if (this.data.loading) return // 已经在加载中了
    wx.showLoading({
      title: '加载中',
    })
    this.data.loading = true
    app.http.get('/api/customer/mall/getProductList', {
      page: this.data.page,
      limit:this.data.limit,
    }).then(res => {
      let getProductList = this.data.getProductList.concat(res)
      this.setData({
        getProductList
      }, () => {
        wx.hideLoading()
        this.data.loading = false
        if (res && res.length < size) {
          this.setData({
            loaded: true
          })
        } else {
          this.data.page++
        }
      })
    })
  },

  show_modal(e)
  {
    let pid = e.currentTarget.dataset.pid;
    app.http.post('/api/coupon/getCouponByPid', {
      product_id:pid
    }).then(res => {
      this.setData({
        coupon_id: res.data.id,
        coupon_price:res.data.price,
        coupon_date:res.data.date,
        showModal:true,
      })
    })
  },
  hide_modal()
  {
    this.setData({
      showModal:false,
    })
  },
    //领取优惠券
    get_coupon()
    {
     app.http.post('/api/coupon/setcoupon', {
       coupon_id: this.data.coupon_id,
     }).then(res => {
       wx.showToast({
         title: '领取成功',
         icon: 'none',
       })
      
       //隐藏成功领取的优惠券 
       let  getProductList = this.data.getProductList;
       let index = 0;
       for (let item of getProductList) {
         if (item.id == this.data.pid) {
          getProductList[index].coupon.status = 0;//已经领取
         }
         index++;
       }
       this.setData({
         showModal:false,
         getProductList:getProductList,
       })
     })
    },
  getPartnerInfo() {
    app.http.get('/api/customer/mall/getPartnerInfo').then(res => {
      app.globalData.partnerInfo = res;
      this.setData({
        getPartnerInfo: res
      }, () => {
        wx.hideLoading()
      })
    })
  },
  //获取首页banner轮播图
  getBanner()
  {
    app.http.post('/api/marketing/getbanner', {}).then(res => {
      this.setData({
        bannerList:res,
      })
    });
  },
  goDetails(e) {
    let getProductList = this.data.getProductList.filter(ele => {
      return ele.id == e.currentTarget.id
    })
    app.varStorage.set('storeDetail', getProductList[0])
    wx.navigateTo({
      url: '/pages/customer/detail/detail?id=' + e.currentTarget.id
    })
  },
  nextPage() {
    if (!this.data.loaded) { // 没有到最后一页
      this.getProductList()
    }
  },
  onLoad: function () {
    self = this;
    this.getinfo()
    wx.showLoading({
      title: '加载中',
    })
    wx.getStorage({
      key: 'noviceShow',
      success(e) {
        self.setData({
          noviceShow: 0
        })
      },
      fail(e) {
        self.setData({
          noviceShow: 1
        })
      }
    })
  },
  contact() {
    Contact.show(this.data.getPartnerInfo)
  },
  onReady() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().toggleToClient()
    }
  },
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    if (!this.data.loading) {
      // 重置数据
      this.setData({
        getProductList: [],
        page: 1,
        loading: false,
        loaded: false
      })
      this.getProductList()
    }

     //获取banner轮播广告
     this.getBanner();
  },
  touchMove() {
    return
  },
  goHelper() {
    this.closeNovice();
    wx.navigateTo({
      "url": "/pages/partner/personal/helper/index"
    })
  },
  goHelperAll() {
    wx.navigateTo({
      "url": "/pages/partner/useDesc/index"
    })
  },
  closeNovice() {
    wx.setStorage({
      key: 'noviceShow',
      data: 1,
      success() {
        self.setData({
          noviceShow: 0
        })
      }
    })
  }
})