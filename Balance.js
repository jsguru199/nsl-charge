import {SafeAreaView, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {Component} from "react";
import {Header} from 'react-native-elements';
import PaymentActions from "../parts/payment-actions";
import BalancePart from "../parts/balance-part";
import {PRIMARY_BLUE} from "../constants/css-colors";
import {connect} from "react-redux";
import HEADER_STYLES from "../styles/header-styles";
import BottomBar from "../parts/bottom-bar";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import SCROLL_STYLES from "../styles/scroll-styles";
import {logoutFunc} from "../helpers/auth-helper";
import HeaderLogo from "../parts/header-logo";
import NoInternetPart from "../parts/no-internet-part";
import {setCurrentScreen} from "../helpers/analytics-helper";

class Balance extends Component {

    state = {
        pageTitle: 'NSL',
        loaded: false
    };

    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
    }

    async logout() {
        await logoutFunc();
        this.props.navigation.navigate('LoginOrRegister')
    }

    render() {

        const { firstName, lastName } = this.props.user;

        return (
            <View style={styles.container}>
                <NoInternetPart/>
                <Header
                    leftComponent={{ icon: 'arrow-back',type: 'material', color: PRIMARY_BLUE,size: 20, onPress: () => this.props.navigation.navigate('Home') }}
                    rightComponent={{ icon: 'input', color: PRIMARY_BLUE,size: 20, onPress: () => this.logout() }}
                    containerStyle={HEADER_STYLES}
                    centerComponent={<HeaderLogo/>}
                />
                <SafeAreaView style={SCROLL_STYLES}>
                    <ScrollView>
                        <View style={styles.contentWrapper}>
                            <BalancePart/>
                            <View style={{marginTop: 10}}>
                                <PaymentActions navigation={this.props.navigation}/>
                            </View>
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

export default connect(mapStateToProps)(Balance);

const styles = StyleSheet.create({
    container: {
        ...PAGE_WRAPPER_STYLES.container,
        justifyContent: 'space-between',
    },
    title: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 5,
      fontWeight: 'bold',
      color: PRIMARY_BLUE
    },
    contentWrapper: {
        padding: 10,
        marginTop: 10,
    }
});
