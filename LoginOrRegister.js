import {StyleSheet, Text, View} from "react-native";
import React, {Component} from "react";
import {Button, Input, Image, Header} from 'react-native-elements';
import {PARAGRAPH_SILVER, PRIMARY_BLUE, TEXT_BLUE} from "../constants/css-colors";
import {connect} from "react-redux";
import AsyncStorage from '@react-native-community/async-storage';
import {LOGIN_OR_REGISTER, MOBILE_NUMBER} from "../constants/app-vars";
import {checkDeviceFunc} from "../helpers/auth-helper";
import {updateDeviceToken, updateUser} from "../actions/auth.action";
import INPUT_STYLES from "../styles/input-styles";
import BOTTOM_BUTTON_STYLES from "../styles/bottom-button-styles";
import BODY_WRAPPER_STYLES from "../styles/body-wrapper-styles";
import Loading from "../parts/loading";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import HEADER_STYLES from "../styles/header-styles";
import HeaderLogo from "../parts/header-logo";
import {ifValidPhoneNumber} from "../helpers/validators";
import NoInternetPart from "../parts/no-internet-part";
import {loginEvent, setCurrentScreen, setUserId} from "../helpers/analytics-helper";



class LoginOrRegister extends Component {

    state = {
        pageTitle: 'Sign In | Sign Up',
        mobileNumber: '',
        console: '',
        loading: false,
        imageLoaded: false,
        icons: {
            mobile: require('../assets/images/icon/mobile.png'),
        }
    };

    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
        setUserId(null)
    }

    changeMobileNumber(text) {
        this.setState({
            ...this.state,
            mobileNumber: text,
        });
    }

    async checkDeviceStatus() {
        const res = await checkDeviceFunc();
        this.setState({
            loading: false
        });
        const userId = res.userId;
        const user = {
            ...this.props.user,
            userId: userId || null,
            mobileNumber: res.phoneNumber,
            firstName:res.firstName,
            lastName:res.lastName,
        };
        this.props.updateUser(user);
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
                loginEvent(user, 'phone_number');
                this.props.navigation.navigate('Login', { firstLogin: true });
                break;
            case 'NEW_REGISTRATION':
                this.props.navigation.navigate('Registration');
                break;
        }
    }

    async loginAction() {
        this.setState({
            console: '',
            loading: true
        });
        if(this.state.mobileNumber.length >= 3) {
            try {
                await AsyncStorage.setItem(`@${MOBILE_NUMBER}`, this.state.mobileNumber);
                this.checkDeviceStatus();
            } catch (e) {
                this.setState({
                    console: e.message,
                    loading: false
                })
            }
        } else {
            this.setState({
                loading: false,
                console: 'Please enter valid phone number'
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <NoInternetPart/>
                <Header
                    containerStyle={HEADER_STYLES}
                    centerComponent={<HeaderLogo/>}
                />
                <Text style={styles.pageTitle}>{this.state.pageTitle}</Text>
                <View style={styles.formWrapper}>
                    <View>
                        <Input
                            inputContainerStyle={styles.inputContainerStyle}
                            style={styles.input}
                            placeholder='Mobile Number'
                            /*leftIcon={
                                <Image
                                    style={this.state.imageLoaded ? styles.image : {...styles.image,opacity: 0}}
                                    source={this.state.icons.mobile}
                                    onLoad={() => this.setState({imageLoaded: true})}
                                />
                            }*/
                            leftIcon={{ type: 'font-awesome', name: 'mobile',color: PRIMARY_BLUE }}
                            inputStyle={styles.input}
                            labelStyle={styles.label}
                            onChangeText={(text)=>this.changeMobileNumber(text)}
                            keyboardType="phone-pad"
                            label={'Mobile Number'}
                        />
                        <Loading loading={this.state.loading} errorMessage={this.state.console}/>
                    </View>
                    <View style={styles.bottomWrapper}>
                        <Button
                            onPress={() => this.loginAction()}
                            title="Submit"
                            buttonStyle={styles.button}
                            disabled={this.state.loading || !ifValidPhoneNumber(this.state.mobileNumber)}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(LoginOrRegister);

const styles = StyleSheet.create({
    pageTitle: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 40,
        fontWeight: 'bold',
        color: PARAGRAPH_SILVER,
    },
    image: {
      width: 13,
      height: 24
    },
    ...INPUT_STYLES,
    ...BOTTOM_BUTTON_STYLES,
    ...BODY_WRAPPER_STYLES,
    ...PAGE_WRAPPER_STYLES
});
