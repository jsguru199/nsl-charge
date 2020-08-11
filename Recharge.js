import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image} from "react-native";
import React, {Component} from "react";
import {Button, Card, Header} from 'react-native-elements';
import BalancePart from "../parts/balance-part";
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
import Loading from "../parts/loading";
import {providerPlansListFunc} from "../helpers/recharge-helper";
import {getImageSize} from "../helpers/image-helper";
import {setCurrentScreen} from "../helpers/analytics-helper";

const PER_PAGE = 10;
const MAX_HEIGHT = 45;
const MAX_WIDTH = 150;

class Recharge extends Component {

    state = {
        pageTitle: 'NSL',
        loading: true,
        perPage: PER_PAGE,
        plans: [],
        providerPlaceholder: {
            image: require('../assets/images/prov_loader.png'),
            width: 70,
            height: 42
        }
    };


    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
        this.getProviderPlansList();
    }

    componentDidUpdate(props, state) {
        if(this.state.plans.length != state.plans.length) {
            this.setPlansLogoSizes();
        }
    }


    async getProviderPlansList() {
        const res = await providerPlansListFunc(this.props.user, this.props.provider);
        if(res.success) {
            this.setState({
                plans: res.plans,
                loading: false,
            });
        } else {
            this.setState({
                console: res.errorMessage,
                loading: false,
            });
        }
    }

    async setPlansLogoSizes() {
        const plans = this.state.plans;
        for (const plan of plans) {
            const sizes = await getImageSize(plan.logo, MAX_HEIGHT, MAX_WIDTH)
            plan.width = sizes.width;
            plan.height = sizes.height;
        }
        this.setState({
            plans
        })
    }

    showMore() {
        const perPage = this.state.perPage + PER_PAGE;
        this.setState({
            perPage
        })
    }

    navigateToConfirmRecharge(plan) {
        // plan.precio = parseFloat(plan.precio)
        this.props.navigation.navigate('ConfirmRecharge', {plan})
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
                    leftComponent={{ icon: 'arrow-back',type: 'material', color: PRIMARY_BLUE,size: 20, onPress: () => this.props.navigation.navigate('ChooseProvider') }}
                    rightComponent={{ icon: 'input', color: PRIMARY_BLUE,size: 20, onPress: () => this.logout() }}
                    containerStyle={HEADER_STYLES}
                    centerComponent={<HeaderLogo/>}
                />
                <SafeAreaView style={SCROLL_STYLES}>
                    <ScrollView>
                        <View style={styles.contentWrapper}>
                            <BalancePart/>
                            {
                                (!this.state.loading) ?
                                    <View style={styles.plans}>
                                    {
                                        this.state.plans.filter((item, index ) => index < this.state.perPage).map((plan, index) => (
                                            <Card containerStyle={CARD_STYLES} wrapperStyle={styles.cardWrapper} key={index}>
                                                <TouchableOpacity onPress={() => this.navigateToConfirmRecharge(plan) }>
                                                    <View style={styles.headerWrapper}>
                                                        <Image
                                                            style={{
                                                                width: plan.width || this.state.providerPlaceholder.width,
                                                                height: plan.height || this.state.providerPlaceholder.height
                                                            }}
                                                            source={(plan.width)?{uri: plan.logo}:this.state.providerPlaceholder.image}
                                                            resizeMethod={'scale'}
                                                        />
                                                        <Text style={styles.text}>{plan.servicio} {plan.producto}</Text>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.price}>${plan.precio}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </Card>
                                        ))
                                    }
                                </View> :  null

                            }
                            <Loading loading={this.state.loading} errorMessage={this.state.console}/>
                            <Button
                                disabled={this.state.perPage >= this.state.plans.length}
                                buttonStyle={styles.button}
                                title="More"
                                onPress={()=> this.showMore()}
                            />
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
        provider: state.provider
    };
};

export default connect(mapStateToProps)(Recharge);

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
        // height: 50,
        resizeMode : 'stretch',
        // width: 50
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
    button: {
        backgroundColor: BACKGROUND_COLOR,
        marginLeft: 20,
        marginRight: 20,
    },
});
