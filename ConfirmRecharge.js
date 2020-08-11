import {SafeAreaView, ScrollView, StyleSheet, Text, View, Image} from "react-native";
import React, {Component} from "react";
import {Button, Card, Header, Overlay} from 'react-native-elements';
import NoInternetPart from "../parts/no-internet-part";
import {BACKGROUND_COLOR, PARAGRAPH_SILVER, PRIMARY_BLUE} from "../constants/css-colors";
import HEADER_STYLES from "../styles/header-styles";
import HeaderLogo from "../parts/header-logo";
import SCROLL_STYLES from "../styles/scroll-styles";
import {connect} from "react-redux";
import {logoutFunc} from "../helpers/auth-helper";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import CARD_STYLES from "../styles/card-styles";
import BottomBar from "../parts/bottom-bar";
import BOTTOM_BUTTON_STYLES from "../styles/bottom-button-styles";
import {rechargeFunc} from "../helpers/recharge-helper";
import Loading from "../parts/loading";
import {getImageSize} from "../helpers/image-helper";
import {updateBalance} from "../actions/auth.action";
import PropTypes from "prop-types";
import OVERLAY_PART, {OVERLAY_BACKGROUND_COLOR} from "../styles/overlay-styles";
import {rechargePageEvent, rechargePaymentEvent, setCurrentScreen} from "../helpers/analytics-helper";


const MAX_HEIGHT = 45;
const MAX_WIDTH = 150;

class ConfirmRecharge extends Component {

    state = {
        pageTitle: 'NSL',
        loading: true,
        plan: null,
        console: '',
        overlayText: ''
    };


    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
        const { params } = this.props.navigation.state;
        const plan = params ? params.plan : null;
        this.setState({
            plan,
            loading: false
        });
        this.setPlanLogoSizes(plan);
        rechargePageEvent(plan, this.props.user);
    }
    async setPlanLogoSizes(plan) {
        if(plan) {
            const sizes = await getImageSize(plan.logo, MAX_HEIGHT, MAX_WIDTH);
            plan.width = sizes.width;
            plan.height = sizes.height;
            this.setState({
                plan
            })
        }
    }

    async recharge(applyCredit) {
        const {credit, balance} = this.props.balance;
        if ((credit + balance) < this.state.plan.precio) {
            this.setState({
                console: 'Insufficient Balance, Please Top Up your account to add more balance'
            })
        } else {
            this.setState({
                loading: true,
                console: '',
                overlayText: ''
            });
            const res = await rechargeFunc(
                this.props.user,
                this.props.provider,
                this.state.plan,
                applyCredit
            );
            if (res.success) {
                this.setState({
                    overlayText: res.errorMessage,
                    loading: false,
                });
                const balance = {
                    credit:(typeof res.credit === "number")?res.credit:credit,
                    balance:(typeof res.balance === "number")?res.balance:balance
                };
                this.props.updateBalance(balance);
                rechargePaymentEvent(this.state.plan, this.props.user, balance, applyCredit);
            } else if(!res.success && res.redirect) {
                this.props.navigation.navigate('Recharge');
            } else {
                this.setState({
                    overlayText: res.errorMessage,
                    loading: false
                });
            }
        }
    }

    goToBalancePage() {
        this.setState({
            overlayText: ''
        });
        this.props.navigation.navigate('Balance')
    }

    async logout() {
        await logoutFunc();
        this.props.navigation.navigate('LoginOrRegister')
    }



    render() {
    // || creditToPay > this.props.balance.credit
        const creditToPay = (this.state.plan)?this.state.plan.precio - this.props.balance.balance:0;

        return (
            <View style={styles.container}>
                <NoInternetPart/>
                <Header
                    leftComponent={{ icon: 'arrow-back',type: 'material', color: PRIMARY_BLUE,size: 20, onPress: () => this.props.navigation.navigate('Recharge') }}
                    rightComponent={{ icon: 'input', color: PRIMARY_BLUE,size: 20, onPress: () => this.logout() }}
                    containerStyle={HEADER_STYLES}
                    centerComponent={<HeaderLogo/>}
                />
                <SafeAreaView style={SCROLL_STYLES}>
                    <ScrollView>
                        <View style={styles.contentWrapper}>
                            {
                                (this.state.plan) ?
                                    <View style={styles.plans}>
                                        <Card containerStyle={CARD_STYLES} wrapperStyle={styles.cardWrapper}>
                                            <View style={styles.headerWrapper}>
                                                <Image
                                                    style={{
                                                        width: this.state.plan.width || 0,
                                                        height: this.state.plan.height || 0
                                                    }}
                                                    source={{uri: this.state.plan.logo}}
                                                    resizeMethod={'scale'}
                                                />
                                                <Text style={styles.text}>{this.state.plan.servicio} {this.state.plan.producto}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.price}>${this.state.plan.precio.toFixed(1)}</Text>
                                            </View>
                                        </Card>
                                        <View style={styles.buttons}>
                                            <Button
                                                buttonStyle={{...styles.secondaryBtn,...styles.secondaryBackground}}
                                                title={`Top Up $${this.state.plan.precio.toFixed(1)} from Bancomer 1445`}
                                            />
                                            <Button
                                                buttonStyle={styles.secondaryBtn}
                                                title={`Agent Top Up Your Balance $${(creditToPay).toFixed(1)}`}
                                            />
                                        </View>
                                    </View> : <Text style={styles.errorMessage}>Please go back and choose a plan</Text>
                            }
                            <Loading loading={this.state.loading} errorMessage={this.state.console}/>
                            <Overlay
                                overlayStyle={styles.overlayContainer}
                                isVisible={!!this.state.overlayText}
                                windowBackgroundColor="rgba(255, 255, 255, .5)"
                                overlayBackgroundColor={OVERLAY_BACKGROUND_COLOR}
                                width="auto"
                                height="auto"
                                onBackdropPress={() => this.setState({ overlayText: '' })}
                            >
                             <View style={styles.overlayWrapper}>
                                 <Text style={styles.overlayText}>{this.state.overlayText}</Text>
                                 <Button
                                     titleStyle={styles.overlayBtnText}
                                     buttonStyle={styles.overlayBtnWrapper}
                                     containerStyle={styles.overlayBtn}
                                     title="Ok"
                                     onPress={() => this.goToBalancePage()}
                                     raised
                                 />
                             </View>
                            </Overlay>
                            {
                                (this.state.plan)? (
                                    <View style={styles.bottomWrapper}>
                                        <Button
                                            disabled={(this.props.balance.balance > this.state.plan.precio)  || this.state.loading || !this.state.plan}
                                            buttonStyle={styles.button}
                                            title={`Apply $${(creditToPay).toFixed(1)} from credit`}
                                            onPress={()=>  this.recharge("YES")}
                                        />
                                        <Button
                                            onPress={()=>  this.recharge("NO")}
                                            title="Confirm"
                                            buttonStyle={styles.button}
                                            disabled={(this.props.balance.balance <= this.state.plan.precio) || this.state.loading || !this.state.plan}
                                        />
                                    </View>
                                ): null
                            }
                        </View>
                    </ScrollView>
                </SafeAreaView>
                <BottomBar navigation={this.props.navigation}/>
            </View>
        );
    }
}

ConfirmRecharge.propTypes = {
    updateBalance: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    updateBalance
};

const mapStateToProps = state => {
    return {
        user: state.user,
        provider: state.provider,
        balance: state.balance,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmRecharge);

const styles = StyleSheet.create({
    container: {
        ...PAGE_WRAPPER_STYLES.container,
        justifyContent: 'space-between',
    },
    contentWrapper: {
        padding: 10,
        marginTop: 10,
    },
    cardWrapper: {
        flexDirection: 'column',
    },
    headerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    image: {
        height: 22,
        width:100
    },
    errorMessage: {
        color: 'red',
        fontSize: 15,
        margin: 5,
        textAlign: 'center'
    },
    text: {
        fontSize: 15,
        maxWidth: 190,
        paddingLeft: 20,
        paddingRight: 5,
        color: PARAGRAPH_SILVER
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 5,
        color: PARAGRAPH_SILVER
    },
    plans: {

    },
    buttons: {
        marginTop: 30,
    },
    secondaryBtn: {
        backgroundColor: BACKGROUND_COLOR,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
    },
    confirmBtn: {
        backgroundColor: BACKGROUND_COLOR,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
    },
    bottomWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 15
    },
    button: {
      borderRadius: 4,
      marginLeft: 5,
      marginRight: 5,
      backgroundColor: PRIMARY_BLUE
    },
    secondaryBackground: {
        backgroundColor: PRIMARY_BLUE
    },
    ...OVERLAY_PART
});
