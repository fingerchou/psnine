import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Animated,
  Keyboard,
  PixelRatio,
  ToolbarAndroid
} from 'react-native'

import { connect } from 'react-redux'

import { getTrophyList } from '../../redux/action/stats'
import { removeAll, removeItem } from '../../utils/statistics'

import Ionicons from 'react-native-vector-icons/Ionicons'
import {
  standardColor,
  idColor,
  levelColor,
  rankColor,
  trophyColor1,
  trophyColor2,
  trophyColor3,
  trophyColor4
} from '../../constant/colorConfig'

import { getHomeAPI } from '../../dao'

import CreateUserTab from './Tab'

declare var global

let toolbarHeight = 56

const limit = 360 // - toolbarHeight

import {
  AppBarLayoutAndroid,
  CoordinatorLayoutAndroid,
  CollapsingToolbarLayoutAndroid
} from 'mao-rn-android-kit'

import ImageBackground from '../../component/ImageBackground'

class StatsHome extends Component<any, any> {

  constructor(props) {
    super(props)
    this.state = {
      data: false,
      isLoading: true,
      toolbar: [{
        title: '同步最新数据', iconName: 'md-sync', value: '', show: 'never'
      }, {
        title: '清空同步数据', iconName: 'md-sync', value: '', show: 'never'
      }],
      text: '同步中',
      gameList: [],
      trophyList: [],
      afterEachHooks: [],
      mainContent: false,
      rotation: new Animated.Value(1),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      openVal: new Animated.Value(0),
      modalVisible: false,
      modalOpenVal: new Animated.Value(0),
      marginTop: new Animated.Value(0),
      onActionSelected: this._onActionSelected,
      icons: false,
      leftIcon: false,
      rightIcon: false,
      middleIcon: false,
      statsInfo: {},
      unearnedTrophyList: [],
      _scrollHeight: this.props.screenProps.modeInfo.height - 64
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props.stats.notifyText !== '同步中' && nextProps.stats.notifyText === '同步中', '===> receiver start')
    if (this.props.screenProps.modeInfo.width !== nextProps.screenProps.modeInfo.width) {
      this.preFetch()
      // this.props.navigation.navigate('Home', params)
    } else if (this.props.stats.notifyText !== '同步中' && nextProps.stats.notifyText === '同步中') {
      const { gameList, isLoading, trophyList, unearnedTrophyList, statsInfo } = nextProps.stats
      console.log(gameList.length, '===> receiver')
      this.setState({
        isLoading,
        gameList,
        trophyList,
        unearnedTrophyList,
        statsInfo
      }, () => this._coordinatorLayout && this._coordinatorLayout.setScrollingViewBehavior(
        this._scrollView
      ))
    }
  }

  removeListener: any = false
  keyboardDidHideListener: any = false
  timeout: any = false
  _coordinatorLayout: any = false
  sad: any = false
  componentWillUnmount() {
    this.removeListener && this.removeListener.remove()
    if (this.timeout) clearTimeout(this.timeout)
    // this.keyboardDidShowListener && this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove()
  }

  async componentWillMount() {
    // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
    //   // console.log(event.nativeEvent, this._coordinatorLayout.resetBehavior)
    //   this._coordinatorLayout.resetBehavior(this._appBarLayout, false, true)
    // })
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // this._coordinatorLayout.setScrollingViewBehavior(this._scrollView)
      this._coordinatorLayout.resetBehavior(this._appBarLayout, false)
    })

    this.preFetch()
  }

  preFetch = async (forceNew = false) => {
    const { params } = this.props.navigation.state
    await this.setState({
      isLoading: true
    })
    const targetColor = this.props.screenProps.modeInfo.isNightMode ? '#000' : '#fff'

    const result = await Promise.all([
      Ionicons.getImageSource('md-arrow-back', 24, targetColor),
      Ionicons.getImageSource('md-sync', 24, targetColor),
      Ionicons.getImageSource('md-more', 24, targetColor)
    ])
    await this.setState({
      leftIcon: result[0],
      middleIcon: result[1],
      rightIcon: result[2]
    })

    const data = await getHomeAPI(params.URL)
    await this.setState({ data })
    console.log(this.props.stats.gameList.length, '====> start dispatch')
    if (this.props.stats.isLoading === true) return
    const {
      gameList,
      trophyList,
      unearnedTrophyList,
      statsInfo
    } = await this.props.dispatch(
      getTrophyList(data.playerInfo.psnid, data, forceNew)
    )
    console.log('preFetch start')
    console.log(gameList.length, '===> prefetch')
    console.log('preFetch end')
    this.setState({
      isLoading: false,
      gameList,
      trophyList,
      unearnedTrophyList,
      statsInfo
    }, () => this._coordinatorLayout && this._coordinatorLayout.setScrollingViewBehavior(
      this._scrollView
    ))

  }

  handleImageOnclick = (url) => this.props.navigation.navigate('ImageViewer', {
    images: [
      { url }
    ]
  })

  renderHeader = (rowData) => {
    const color = 'rgba(255,255,255,1)'
    const infoColor = 'rgba(255,255,255,0.8)'
    const { width: SCREEN_WIDTH } = Dimensions.get('window')
    const onPressPoint = () => {
      global.toast(rowData.point)
    }
    const statusHeight = StatusBar.currentHeight || 0
    return (
      <ImageBackground
        source={{uri: rowData.backgroundImage}}
        style={{
          height: limit + toolbarHeight + 1,
          width: SCREEN_WIDTH
        }}
        blurRadis={0}
        >
        <global.LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
          locations={[0, 0.4, 0.6, 1]}
          start={{x: 0.5, y: 0}} end={{x: 0.5, y: 1}}>
          <View key={rowData.id} style={{
            backgroundColor: 'transparent',
            height: 360,
            marginTop: 56 + statusHeight / 2 + 8
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex: -1, padding: 5, marginTop: -10  }}>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 2, marginTop: 2  }}>
                <Text style={{ flex: -1, color: infoColor, fontSize: 15, textAlign: 'center' }}>{rowData.description}</Text>
                {
                    rowData.icons && rowData.icons.length && <View
                      style={{flexDirection: 'row', marginVertical: 2}}>{rowData.icons.filter((item, index) => index <= 2).map((item, index) => {
                      return (
                        <Image
                          key={index}
                          borderRadius={12}
                          source={{ uri: item}}
                          style={[styles.avatar, { width: 20, height: 20, overlayColor: 'rgba(0,0,0,0.0)', backgroundColor: 'transparent'
                          }]}
                        />
                      )
                    })}</View>
                  }
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1  }}>
                <Text style={{ flex: -1, color: levelColor, fontSize: 20 }} onPress={onPressPoint}>{rowData.exp.split('经验')[0]}</Text>
                <Text style={{ flex: -1, color: infoColor, fontSize: 12 }} onPress={onPressPoint}>经验{rowData.exp.split('经验')[1]}</Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1  }}>
                <Text style={{ flex: -1, color: rankColor, fontSize: 20 }}>{rowData.ranking || 'None'}</Text>
                <Text style={{ flex: -1, color: infoColor, fontSize: 12 }}>所在服排名</Text>
              </View>
            </View>

            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: limit }}>
              <View style={{ justifyContent: 'center', alignItems: 'center',
                alignSelf: 'center', flex: 3, marginTop: -70 - statusHeight * 1.5 + 10 }}>
                <View borderRadius={75} style={{width: 150, height: 150, backgroundColor: 'transparent'}} >
                  <Image
                    borderRadius={75}
                    source={{ uri: rowData.avatar}}
                    style={[styles.avatar, { width: 150, height: 150, overlayColor: 'rgba(0,0,0,0.0)', backgroundColor: 'transparent' }]}
                  />
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex: 3, elevation: 4  }}>
            </View>

            <View style={{ flex: 1, padding: 5}}>
              <View borderRadius={20} style={{
                paddingHorizontal: 10, alignSelf: 'center', alignContent: 'center',
                flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'  }}>
                <Text style={{ height: 30, textAlignVertical: 'center', textAlign: 'center' }}>
                  <Text style={{ flex: 1, color: trophyColor1, marginVertical: 2, textAlign: 'center', fontSize: 15 }}>{rowData.platinum + ' '}</Text>
                  <Text style={{ flex: 1, color: trophyColor2, marginVertical: 2, textAlign: 'center', fontSize: 15 }}>{rowData.gold + ' '}</Text>
                  <Text style={{ flex: 1, color: trophyColor3, marginVertical: 2, textAlign: 'center', fontSize: 15 }}>{rowData.silver + ' '}</Text>
                  <Text style={{ flex: 1, color: trophyColor4, marginVertical: 2, textAlign: 'center', fontSize: 15 }}>{rowData.bronze + ' '}</Text>
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex: 1,
              padding: 6,
              bottom: 20  }}>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1  }}>
                <Text style={{ flex: 1, color: color, textAlign: 'center', fontSize: 20 }}>{rowData.allGames}</Text>
                <Text style={{ flex: 1, color: infoColor, textAlign: 'center', fontSize: 12 }}>总游戏</Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1  }}>
                <Text style={{ flex: 1, color: color, textAlign: 'center', fontSize: 20 }}>{rowData.perfectGames}</Text>
                <Text style={{ flex: 1, color: infoColor, textAlign: 'center', fontSize: 12 }}>完美数</Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1  }}>
                <Text style={{ flex: 1, color: color, textAlign: 'center', fontSize: 20 }}>{rowData.hole}</Text>
                <Text style={{ flex: 1, color: infoColor, textAlign: 'center', fontSize: 12 }}>坑数</Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1  }}>
                <Text style={{ flex: 1, color: color, textAlign: 'center', fontSize: 20 }}>{(rowData.ratio || '').replace('完成率', '')}</Text>
                <Text style={{ flex: 1, color: infoColor, textAlign: 'center', fontSize: 12 }}>完成率</Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1  }}>
                <Text style={{ flex: 1, color: color, textAlign: 'center', fontSize: 20 }}>{rowData.followed}</Text>
                <Text style={{ flex: 1, color: infoColor, textAlign: 'center', fontSize: 12 }}>总奖杯</Text>
              </View>
            </View>
          </View>
        </global.LinearGradient>
      </ImageBackground>
    )
  }

  renderTabContainer = (list) => {
    const { modeInfo } = this.props.screenProps
    const { params } = this.props.navigation.state

    return (
      <CreateUserTab screenProps={{
        modeInfo: modeInfo,
        toolbar: list,
        preFetch: this.preFetch,
        gameList: this.state.gameList,
        trophyList: this.state.trophyList,
        unearnedTrophyList: this.state.unearnedTrophyList,
        statsInfo: this.state.statsInfo,
        setToolbar: ({ toolbar, toolbarActions, componentDidFocus }) => {
          const obj: any = {
            toolbar,
            onActionSelected: toolbarActions
          }
          if (componentDidFocus) {
            const { index, handler } = componentDidFocus
            if (!this.state.afterEachHooks[index]) {
              obj.afterEachHooks = [...this.state.afterEachHooks]
              obj.afterEachHooks[index] = handler
            }
          }
          {/*this.setState(obj)*/}
        },
        psnid: params.title,
        navigation: this.props.navigation
      }} onNavigationStateChange={(prevRoute, nextRoute, action) => {
        if (prevRoute.index !== nextRoute.index && action.type === 'Navigation/NAVIGATE') {

        }
      }}/>
    )
  }

 _onActionSelected = async (index) => {
    switch (index) {
      case 0:
        this.preFetch(true)
        return
      case 1:
        const { params } = this.props.navigation.state
        const data = await getHomeAPI(params.URL)
        return removeItem(data.playerInfo.psnid)
    }
  }

  onIconClicked = () => this.props.navigation.goBack()

  toolbar = [
    {'title': '游戏同步', 'iconName': 'md-sync', 'show': 'never'},
    {'title': '等级同步', 'iconName': 'md-sync', 'show': 'never'},
    {'title': '感谢', 'iconName': 'md-thumbs-up', 'show': 'never'},
    {'title': '关注', 'iconName': 'md-star-half', 'show': 'never'},
    {'title': '屏蔽', 'iconName': 'md-sync', 'show': 'never'}
  ]

  render() {
    const { params } = this.props.navigation.state
    console.log('Home.js rendered')
    const { modeInfo } = this.props.screenProps
    const { data: source, gameList } = this.state
    console.log(!!source.playerInfo, 
      !!this.state.leftIcon,
      gameList.length !== 0, !this.state.isLoading, '===> render')
    // console.log(JSON.stringify(profileToolbar))
    return source.playerInfo && this.state.leftIcon && gameList.length !== 0 && !this.state.isLoading ? (
      <View style={{flex: 1}}>
        <CoordinatorLayoutAndroid
          fitsSystemWindows={false}
          ref={this._setCoordinatorLayout}>

          <AppBarLayoutAndroid
            ref={this._setAppBarLayout}
            fitsSystemWindows={false}
            style={styles.appbar} >
            <CollapsingToolbarLayoutAndroid
              collapsedTitleColor={modeInfo.backgroundColor}
              contentScrimColor={modeInfo.standardColor}
              expandedTitleColor={modeInfo.titleTextColor}
              statusBarScrimColor={modeInfo.standardColor}
              titleEnable={false}
              layoutParams={{
                scrollFlags: (
                  AppBarLayoutAndroid.SCROLL_FLAG_SCROLL |
                  AppBarLayoutAndroid.SCROLL_FLAG_SNAP |
                  AppBarLayoutAndroid.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED
                )
              }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: modeInfo.standardColor
                }}
                layoutParams={{
                  collapseParallaxMultiplie: 0.7,
                  collapseMode: CollapsingToolbarLayoutAndroid.CollapseMode.COLLAPSE_MODE_PARALLAX
                }}>
                {source.playerInfo && this.renderHeader(source.playerInfo)}
              </View>
              <ToolbarAndroid
                navIcon={this.state.leftIcon}
                overflowIcon={this.state.rightIcon}
                title={`${params.title}`}
                origin
                titleColor={modeInfo.isNightMode ? '#000' : '#fff'}
                actions={this.state.toolbar}
                layoutParams={{
                  height: 56 + StatusBar.currentHeight / 2, // required,
                  collapseMode: CollapsingToolbarLayoutAndroid.CollapseMode.COLLAPSE_MODE_PIN // required
                }}
                onIconClicked={this.onIconClicked}
                onActionSelected={this._onActionSelected}
                marginTop={56 + 8}
                paddingTop={PixelRatio.getPixelSizeForLayoutSize(8)}
                minHeight={PixelRatio.getPixelSizeForLayoutSize(64)}
              />
            </CollapsingToolbarLayoutAndroid>
          </AppBarLayoutAndroid>

          <View
            style={[styles.scrollView, { height: this.state._scrollHeight, backgroundColor: modeInfo.backgroundColor }]}
            ref={this._setScrollView}>
            {/*<NestedScrollViewAndroid>
              {this._getItems(30)}
            </NestedScrollViewAndroid>*/}
            {this.renderTabContainer(source.toolbarInfo)}
          </View>
        </CoordinatorLayoutAndroid>
      </View>
    ) : <View style={{ flex: 1, backgroundColor: modeInfo.backgroundColor }}>
      <Ionicons.ToolbarAndroid
        navIconName='md-arrow-back'
        overflowIconName='md-more'
        iconColor={modeInfo.isNightMode ? '#000' : '#fff'}
        title={params.title}
        titleColor={modeInfo.isNightMode ? '#000' : '#fff'}
        style={[styles.toolbar, { backgroundColor: this.state.isLoading ? modeInfo.standardColor : 'transparent' }]}
        actions={this.state.toolbar}
        key={this.state.toolbar.map(item => item.text || '').join('::')}
        onIconClicked={() => this.props.navigation.goBack()}
        onActionSelected={this._onActionSelected}
      />
      <ActivityIndicator
        animating={this.state.isLoading}
        style={{
          flex: 999,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 50
        }}
        color={modeInfo.accentColor}
        size={50}
      />
      <Text style={{
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: modeInfo.standardTextColor
      }}>{this.props.stats.notifyText}</Text>
    </View>
  }

  _appBarLayout = null
  _scrollView = null

  _setCoordinatorLayout = component => {
    this._coordinatorLayout = component
  }

  _setAppBarLayout = component => {
    this._appBarLayout = component
  }

  _setScrollView = component => {
    this._scrollView = component
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF'
  },
  toolbar: {
    backgroundColor: standardColor,
    height: 56,
    elevation: 4
  },
  selectedTitle: {
    // backgroundColor: '#00ffff'
    // fontSize: 20
  },
  avatar: {
    width: 50,
    height: 50
  },
  a: {
    fontWeight: '300',
    color: idColor // make links coloured pink
  },
  appbar: {
    backgroundColor: '#2278F6',
    height: 360 + 56
  },

  navbar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative'
  },

  backBtn: {
    top: 0,
    left: 0,
    height: 56,
    position: 'absolute'
  },

  caption: {
    color: '#fff',
    fontSize: 20
  },

  heading: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4889F1'
  },

  headingText: {
    color: 'rgba(255, 255, 255, .6)'
  },

  scrollView: {
    backgroundColor: '#f2f2f2'
  },

  item: {
    borderRadius: 2,
    height: 200,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },

  itemContent: {
    fontSize: 30,
    color: '#FFF'
  }
})

function mapStateToProps(state) {
  return {
    stats: state.stats
  }
}

export default connect(
  mapStateToProps
)(StatsHome)