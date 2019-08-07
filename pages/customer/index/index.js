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
    categoryList1:[], //横向导航栏
    heightCount:0,   //统计监控交互的高度
    scrollTop:0,    //监控滑动距离
    transverseCar_cateId:0,  //车联网专区的分类id
    transverseCarList:[],    //车联网专区显示数据
    selectClassId:0         //标识选择id
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
    this.CalculationHeight()
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
  onPageScroll:function(res){
    this.setData({ scrollTop: res.scrollTop })
  },
  onShow: async function () {
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
    await this.getCategory()
    //获取车联网专区数据
    this.getTransverseCarData();
  },
  async getCategory()
  {
    const categoryList = await app.http.post('/api/marketing/getCategory', {})
    let categoryList1 = categoryList.filter(function(item,index){
      return index != 0;
    });
    // this.setData({
    //   selectClassId:categoryList1[0].id
    // })
    let transverseCar = categoryList.filter(function(item,index){
      return index === 0
    })
    this.setData({
      transverseCar_cateId:transverseCar[0].id
    })
    // console.log(transverseCar[0].id)
    // let categoryList2 = categoryList.filter(function(item,index){
    //   return index >= 4;
    // });
    this.setData({
      categoryList1: categoryList1,
      // categoryList2:categoryList2
    })
  },
  // 获取车联网专区的数据
  getTransverseCarData(){
    app.http.post('/api/marketing/getCategoryProducts',{cate_id :this.data.transverseCar_cateId}).then(res =>{
      this.setData({transverseCarList:res})
    })
  },
  async CalculationHeight(){
    let height = 0;
    let query = wx.createSelectorQuery()
    const lun = query.select('.countTop')
    const res = await new Promise((resolve, reject) => {
      lun.fields({
        dataset: true,
        size: true,
        scrollOffset: true,
        properties: ['scrollX', 'scrollY']
      }, function (res) {
        resolve(res)
      }).exec()
    })
    height = res.height
    // console.log(res)
    this.setData({heightCount:height})
  },
  //跳转分类列表页面
goList(e)
{
  let cat_id = e.currentTarget.dataset.id;
  this.setData({
    selectClassId:cat_id
  })
  app.http.post('/api/marketing/getCategoryProducts',{cate_id :cat_id}).then(res =>{
    this.setData({getProductList:res})
  })
  // wx.navigateTo({
  //   "url": "/pages/common/list/index?cate_id="+cat_id,
  // });
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