import {StyleSheet, Text, View} from "react-native";
import React, {Component} from "react";
import {Header, Input} from 'react-native-elements';
import {PARAGRAPH_SILVER, PRIMARY_BLUE} from "../constants/css-colors";
import {logoutFunc, setPinFunc} from "../helpers/auth-helper";
import {connect} from "react-redux";
import BOTTOM_BUTTON_STYLES from "../styles/bottom-button-styles";
import HEADER_STYLES from "../styles/header-styles";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import INPUT_PASS_STYLES, {INPUT_BOTTOM_COLOR} from "../styles/input-pass-styles";
import Loading from "../parts/loading";
import HeaderLogo from "../parts/header-logo";
import {ifOnlyNumbers} from "../helpers/validators";
import NoInternetPart from "../parts/no-internet-part";
import {setCurrentScreen} from "../helpers/analytics-helper";

class PinSetup extends Component {

    state = {
        pageTitle: 'Setup Pin',
        inputpinOne: [],
        inputpinTwo: [],
        pinOne: ['','','',''],
        pinTwo: ['','','',''],
        console: '',
        loading: false,
        notNewUser: false
    };

    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
        const { params } = this.props.navigation.state;
        const notNewUser = params ? params.notNewUser : false;
        this.setState({
            notNewUser: notNewUser
        });
        setTimeout(() => {
            this.state[`inputpinOne`][0].focus()
        }, 400)
    }

    changePinNumber(group, number,index) {
        const numbers = this.state[group];
        numbers[index] = number;
        this.setState({
            [group]: numbers
        });
        if(number){
            if(this.state[`input${group}`][index + 1]) {
                this.state[`input${group}`][index + 1].focus()
            }
        }

        if(this.state.pinOne.join('').length === 4 && this.state.pinTwo.join('').length === 4) {
            this.confirmPin();
        }
    }

    deleteNumber({ nativeEvent }, group, index) {
        if(this.state[`input${group}`][index - 1]) {
            this.state[`input${group}`][index - 1].focus()
        }
    }

    async confirmPin() {
        this.setState({
            console: ""
        });
        const numbers1 = this.state.pinOne.join('');
        if(numbers1.length < 4 || !ifOnlyNumbers(numbers1)) {
            this.setState({
                console: "Invalid PIN 1"
            });
            return;
        }
        const numbers2 = this.state.pinTwo.join('');
        if(numbers2.length < 4 || !ifOnlyNumbers(numbers2)) {
            this.setState({
                console: "Invalid PIN 2"
            });
            return;
        }

        if(numbers2 !== numbers1) {
            this.setState({
                console: "PINs do not match"
            });
        } else {
            this.setState({
                loading: true
            });
            const res = await setPinFunc(this.props.user, this.props.deviceToken, numbers1, this.state.notNewUser);
            this.setState({
                loading: false
            });
            if(res.success) {
                this.props.navigation.navigate('Login')
            } else {
                this.setState({
                    console: res.errorMessage
                });
            }
        }
        // this.props.navigation.navigate('Home')
    }

    async logout() {
        await logoutFunc();
        this.props.navigation.navigate('LoginOrRegister')
    }

    render() {
        return (
            <View style={styles.container}>
                <NoInternetPart/>
                <Header
                    rightComponent={{ icon: 'input', color: PRIMARY_BLUE,size: 20, onPress: () => this.logout() }}
                    containerStyle={HEADER_STYLES}
                    centerComponent={<HeaderLogo/>}
                />
                <View style={styles.formWrapper}>
                    <View>
                        <Text style={styles.shortTitle}>Create your 4-digit Pin</Text>
                        <View style={styles.inputs}>
                            {
                               this.state.pinOne.map((item, index) => (
                                   <View style={styles.inputWrapper}  key={`pinOne-${index}`}>
                                       <Input
                                           inputContainerStyle={INPUT_BOTTOM_COLOR}
                                           maxLength={1}
                                           keyboardType="number-pad"
                                           ref={(input) => { this.state.inputpinOne.push(input) }}
                                           onChangeText={(number)=>this.changePinNumber('pinOne', number, index)}
                                           onKeyPress={(e) => this.deleteNumber(e,'pinOne', index)}
                                           inputStyle={styles.input}
                                           secureTextEntry={true}
                                       />
                                   </View>
                               ))
                            }
                        </View>
                        <Text style={{...styles.shortTitle,marginTop: 15}}>Repeat password</Text>
                        <View style={styles.inputs}>
                             {
                                this.state.pinTwo.map((item, index) => (
                                    <View style={styles.inputWrapper} key={`pinTwo-${index}`}>
                                        <Input
                                            inputContainerStyle={INPUT_BOTTOM_COLOR}
                                            maxLength={1}
                                            keyboardType="number-pad"
                                            ref={(input) => { this.state.inputpinTwo.push(input) }}
                                            onChangeText={(number)=>this.changePinNumber('pinTwo', number, index)}
                                            onKeyPress={(e) => this.deleteNumber(e,'pinTwo', index)}
                                            inputStyle={styles.input}
                                            secureTextEntry={true}
                                        />
                                    </View>
                                ))
                            }
                        </View>
                        <Loading loading={this.state.loading} errorMessage={this.state.console}/>
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

export default connect(mapStateToProps)(PinSetup);


const styles = StyleSheet.create({
    shortTitle: {
      fontSize: 15,
      color: PARAGRAPH_SILVER,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 5,
    },
    formWrapper: {
        padding: 10,
        // marginTop: 10,
        // marginBottom: 10,
        justifyContent: 'center',
        flex: 1
    },
    text: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 5,
    },
    ...BOTTOM_BUTTON_STYLES,
    ...PAGE_WRAPPER_STYLES,
    ...INPUT_PASS_STYLES
});
