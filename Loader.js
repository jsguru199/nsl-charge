import {StyleSheet, Text, View} from "react-native";
import React, {Component} from "react";
import {checkDeviceFunc} from "../helpers/auth-helper";
import { updateUser, updateDeviceToken } from '../actions/auth.action'

import {connect} from "react-redux";
import PropTypes from "prop-types";

import {LOGIN_OR_REGISTER} from "../constants/app-vars";
import {Image} from "react-native-elements";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import NoInternetPart from "../parts/no-internet-part";


class Loader extends Component {
    state = {
        pageTitle: 'NSL',
        console: '',
        logo: require('../assets/images/logo.png'),
        show: false,
        requested: true
    };


    componentDidMount() {
        // setCurrentScreen(this.props.navigation.state.routeName);
        this.checkDeviceStatus();
    }

    checkConnectionInfo = (connected) => {
        if(this.state && connected && !this.state.requested) {
            this.checkDeviceStatus();
        }
    };

    async checkDeviceStatus() {
        const res = await checkDeviceFunc();
        /*this.setState({
            console: JSON.stringify(res)
        })*/
        if (res.noNetwork) {
            this.setState({
                requested: false
            });
            return;
        }

        const userId = res.userId;
        this.props.updateUser({
            ...this.props.user,
            userId: userId || null,
            mobileNumber: res.phoneNumber,
            firstName:res.firstName,
            lastName:res.lastName,
        });
        this.props.updateDeviceToken(res.token);

        switch (res.condition) {
            case LOGIN_OR_REGISTER:
                this.props.navigation.navigate('LoginOrRegister');
                break;
            case 'CREATE_NEW_PIN':
                this.props.navigation.navigate('PinSetup', { notNewUser: true });
                break;
            case 'PIN_CREATION_REMAINING':
                this.props.navigation.navigate('PinSetup');
                break;
            case 'LOGIN':
                this.props.navigation.navigate('Login');
                break;
            case 'NEW_REGISTRATION':
                 this.props.navigation.navigate('Registration');
                break;
        }
    }

    render() {
        return (
        <View style={styles.container}>
                <NoInternetPart checkConnectionInfo={this.checkConnectionInfo}/>
                <View style={styles.wrapper}>
                    <Image
                        style={this.state.show ? styles.image : {...styles.image,opacity: 0}}
                        source={this.state.logo}
                        onLoad={() => this.setState({show: true})}
                    />
                   {/* <Text style={styles.title}>NSL</Text>*/}
                    <Text style={styles.errorMessage}>{this.state.console}</Text>
                </View>
            </View>
        );
    }
}

Loader.propTypes = {
    updateDeviceToken: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        deviceToken: state.deviceToken,
        user: state.user
    };
};

const mapDispatchToProps = {
    updateDeviceToken,
    updateUser
};

export default connect(mapStateToProps, mapDispatchToProps)(Loader);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        ...PAGE_WRAPPER_STYLES.container,
    },
    wrapper: {
      justifyContent: 'center',
      flexDirection: 'row'
    },
    errorMessage: {
        color: 'red',
        fontSize: 15,
        margin: 5,
        textAlign: 'center'
    },
    image: {
        height: 19,
        width:100
    },
});
