import {BackHandler, SafeAreaView, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {Component} from "react";


import {Button, Header, Icon} from 'react-native-elements';
import {BACKGROUND_COLOR, PARAGRAPH_SILVER, PRIMARY_BLUE, RED, SILVER, TEXT_BLUE} from "../constants/css-colors";
import {connect} from "react-redux";
import {loginFunc, logoutFunc} from "../helpers/auth-helper";
import {updateUser} from "../actions/auth.action";
import HEADER_STYLES from "../styles/header-styles";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import INPUT_PASS_STYLES, {INPUT_BOTTOM_COLOR} from "../styles/input-pass-styles";
import Loading from "../parts/loading";
import SCROLL_STYLES from "../styles/scroll-styles";
import HeaderLogo from "../parts/header-logo";
import NoInternetPart from "../parts/no-internet-part";
import {loginEvent, setCurrentScreen} from "../helpers/analytics-helper";

class Login extends Component {
    constructor(props) {
        super(props)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    state = {
        pageTitle: 'Enter Pin code',
        pinCode: ['','','',''],
        console: '',
        loading: false,
    };

    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
        this.props.navigation.addListener('willFocus', () => {
            this.setState({
                pinCode: ['','','','']
            });
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

    changePin(number) {
        const numbers = this.state.pinCode;
        const index = numbers.findIndex(item => item === '');
        if(index !== -1) {
            numbers[index] = number;
            this.setState({
                pinCode: numbers
            })
        }

        if(this.state.pinCode.join('').length === 4) {
            this.loginAction();
        }
    }

    deletePinNumber(){
        const numbers = this.state.pinCode;
        for (let i = numbers.length - 1; i >= 0; i--) {
            if(numbers[i] !== '') {
                numbers[i] = '';
                this.setState({
                    pinCode: numbers,
                });
                return;
            }
        }
    }

    async loginAction() {
        this.setState({
            loading: true,
            console: ''
        });
        const res = await loginFunc(this.props.deviceToken, this.props.user, this.state.pinCode.join(''));
        this.setState({
            loading: false
        });
        if(res.success) {
            this.props.updateUser({
                ...this.props.user,
                authToken: res.authToken
            });
            loginEvent(this.props.user, 'PIN');
            this.props.navigation.navigate('Home');
        } else {
            this.setState({
                pinCode: ['','','',''],
                console: res.errorMessage,
            })
        }
    }

    async logout() {
        await logoutFunc();
        this.props.navigation.navigate('LoginOrRegister')
    }

    render() {

        const numbers = [1,2,3,4,5,6,7,8,9,0];

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
                        <View style={styles.formWrapper}>
                            <View>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={styles.pageTitle}>{this.state.pageTitle}</Text>
                                    <View style={styles.inputs}>
                                        {
                                            this.state.pinCode.map( (item, index) => (
                                                <View key={`pin-${index}`} style={styles.inputWrapper}>
                                                    <Text style={styles.inputWrapperText}>{(item !== '')?'*':''}</Text>
                                                </View>
                                            ) )
                                        }
                                    </View>
                                    <Loading loading={this.state.loading} errorMessage={this.state.console}/>
                                    <View style={styles.numbers}>
                                        {
                                            numbers.map( (item, index) => (
                                                <View key={`item-${index}`} style={styles.numbersWrapper}>
                                                    <Text style={styles.numbersWrapperText}  onPress={() => this.changePin(item) }>{item}</Text>
                                                </View>
                                            ) )
                                        }
                                        {/*<View style={styles.numbersWrapper}>
                                <View style={styles.numbersWrapperText}>
                                    <Icon name='clear' color={PRIMARY_BLUE} onPress={() => this.deletePinNumber() }/>
                                </View>
                            </View>*/}
                                    </View>
                                </View>
                                <View>
                                    <Button
                                        containerStyle={styles.clearBtn}
                                        title="Cancel"
                                        type="clear"
                                        onPress={() => this.deletePinNumber() }
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>

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
    updateUser
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = StyleSheet.create({
    pageTitle: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        color: PARAGRAPH_SILVER,
    },
    formWrapper: {
        padding: 10,
        marginBottom: 10,
        justifyContent: 'space-around',
    },
    inputs: {
        ...INPUT_PASS_STYLES.inputs,
    },
    inputWrapperText: {
        textAlign: 'center',
        fontSize: 19,
        lineHeight: 40,
        margin: 5,
        flexDirection: 'column',
        alignItems: 'center',
        ...INPUT_PASS_STYLES.input,
        ...INPUT_BOTTOM_COLOR
    },
    numbers: {
        maxWidth: 260,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        flexWrap: 'wrap',
    },
    numbersWrapper: {
        width: '27%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    numbersWrapperText: {
        fontSize: 22,
        backgroundColor:'#dee7f6',
        color: PRIMARY_BLUE,
        height: 60,
        width: 60,
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 60,
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    clearBtn: {
        marginLeft: 'auto',
    },
    ...PAGE_WRAPPER_STYLES
});
