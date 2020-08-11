import {SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity} from "react-native";
import React, {Component} from "react";
import {Card, Header, Image} from 'react-native-elements';
import PaymentActions from "../parts/payment-actions";
import {PRIMARY_BLUE} from "../constants/css-colors";
import {logoutFunc} from "../helpers/auth-helper";
import {connect} from "react-redux";
import HEADER_STYLES from "../styles/header-styles";
import BottomBar from "../parts/bottom-bar";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import CARD_STYLES from "../styles/card-styles";
import FirstWatchIntro from "../parts/first-watch-intro";
import Loading from "../parts/loading";
import AsyncStorage from "@react-native-community/async-storage";
import SCROLL_STYLES from "../styles/scroll-styles";
import HeaderLogo from "../parts/header-logo";
import NoInternetPart from "../parts/no-internet-part";
import { BackHandler } from 'react-native';
import {setCurrentScreen} from "../helpers/analytics-helper";


class Home extends Component {

    constructor(props) {
        super(props)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    state = {
        pageTitle: 'NSL',
        firstView: true,
        loaded: false,
        show: false,
        walletLogo: require('../assets/images/icon/wallet.png'),
    };

    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
        this.checkFirstView();
        this.props.navigation.addListener('willFocus', () => {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        });
        this.props.navigation.addListener('willBlur', () => {
            BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        });
    }

    handleBackButtonClick() {
        this.props.navigation.goBack(null);
        BackHandler.exitApp();
        return true;
    }

    async checkFirstView() {
        const res =  await AsyncStorage.getItem(`@firstView`);
        this.setState({
            loaded: true
        });
        if(res) {
            this.setState({
                firstView: false
            });
        }
    }

    async changeFirstTimeState() {
        await AsyncStorage.setItem(`@firstView`, 'no');
        try {
            this.setState({
                firstView: false
            });
        } catch (e) {
        }
    }

    async logout() {
        await logoutFunc();
        this.props.navigation.navigate('LoginOrRegister')
    }

    renderView = () => (
        <View>

        </View>
    );

    render() {

        const { firstName, lastName} = this.props.user;

        return (
            <View style={styles.container}>
                 <NoInternetPart/>
                 <Header
                   rightComponent={{ icon: 'input', color: PRIMARY_BLUE,size: 20, onPress: () => this.logout() }}
                   containerStyle={HEADER_STYLES}
                   centerComponent={<HeaderLogo/>}
                  />
                  <SafeAreaView style={SCROLL_STYLES}>
                      <ScrollView>
                          <View style={styles.contentWrapper}>
                              {
                                  (this.state.loaded) ? (this.state.firstView ?
                                      <FirstWatchIntro changeFirstView={ () => this.changeFirstTimeState() }/> :
                                      (<View>
                                          <View style={styles.cardWrapper}>
                                              <Card containerStyle={{alignItems:'center',...CARD_STYLES}}>
                                                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Balance')}>
                                                      <Image
                                                          style={this.state.show ? styles.image : {...styles.image,opacity: 0}}
                                                          source={this.state.walletLogo}
                                                          onLoad={() => this.setState({show: true})}
                                                      />
                                                  </TouchableOpacity>
                                              </Card>
                                              <Text style={styles.cardTitle}>
                                                  Click card to see your balance
                                              </Text>
                                          </View>
                                          <PaymentActions navigation={this.props.navigation}/>
                                      </View>)) :
                                      <Loading loading={!this.state.loaded}/>
                              }
                          </View>
                      </ScrollView>
                  </SafeAreaView>
                 <BottomBar navigation={this.props.navigation}/>
            </View>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
    };
};

// export default Home;
export default connect(mapStateToProps)(Home);

const styles = StyleSheet.create({
    container: {
        ...PAGE_WRAPPER_STYLES.container,
        justifyContent: 'space-between',
        // flexDirection: 'column'
    },
    title: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 5,
      fontWeight: 'bold',
      color: PRIMARY_BLUE
    },
    image: {
        height: 60,
        width: 60
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },

    cardWrapper: {
        marginBottom: 5,
    },
    cardTitle: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 5,
        fontWeight: 'bold',
        color: PRIMARY_BLUE
    },

    contentWrapper: {
        padding: 10,
        marginTop: 10,
    }
});
