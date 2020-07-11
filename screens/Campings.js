import React from "react";
import {
  ImageBackground,
  Platform,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView
} from "react-native";
import { connect } from "react-redux";
import MapView from "react-native-maps";
import * as Icon from "react-native-vector-icons";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import { Constants } from "expo";

import { setLocation, setFilters, setCampings } from "../modules/campings";
import * as mock from "../mock/campings";

const { Marker } = MapView;
const { width, height } = Dimensions.get("screen");

class Campings extends React.Component {
  state = {
    mapRegion: null,
    hasLocationPermissions: false,
    locationResult: null
  };

  componentDidMount() {
    this._getLocationAsync();
    this.props.setCampings(mock.campings);
  }

  _handleMapRegionChange = mapRegion => {
    console.log(mapRegion);
    this.setState({ mapRegion });
  };

  _getLocationAsync = async () => {
   let { status } = await Permissions.askAsync(Permissions.LOCATION);
   if (status !== 'granted') {
     this.setState({
       locationResult: 'Permission to access location was denied',
     });
   } else {
     this.setState({ hasLocationPermissions: true });
   }

   let location = await Location.getCurrentPositionAsync({});
   this.setState({ locationResult: JSON.stringify(location) });
   
   // Center the map on the location we just fetched.
    this.setState({mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }});
  };

  handleTab = tabKey => {
    this.props.setFilters({ type: tabKey });
  };

  renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={{ flex: 2, flexDirection: "row" }}>
            <View style={styles.settings}>
              <View style={styles.location}>
                <Icon.FontAwesome
                  name="location-arrow"
                  size={14}
                  color="white"
                />
              </View>
            </View>
            <View>
            <Image
              style={styles.options} source={{uri: 'https://station-ethanol.fr/assets/img/logo.png'}}
            />
            </View>
          </View>
          <View style={styles.settings}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Settings")}
            >
              <Icon.Ionicons name="ios-settings" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        {this.renderTabs()}
      </View>
    );
  }

  renderMap() {
    const campingMarker = ({ type }) => (
      <View style={[styles.marker, styles[`${type}Marker`]]}>
        {type === "rv" ? (
          <Icon.FontAwesome name="truck" size={18} color="#083854" />
        ) : (
          <Icon.FontAwesome name="map-marker" size={18} color="#083854" />
        )}
      </View>
    );
    const { filters, campings } = this.props;
    const mapSpots =
      filters.type === "all"
        ? campings
        : campings.filter(camping => camping.type === filters.type);

    return (
      <View style={styles.map}>
        {this.state.locationResult === null ?
          <Text>Finding your current location...</Text> :
          this.state.hasLocationPermissions === false ?
            <Text>Location permissions are not granted.</Text> :
            this.state.mapRegion === null ?
            <Text>Map region doesn't exist.</Text> :
            <MapView
              style={{ flex: 1, height: height * 0.5, width }}
              showsMyLocationButton
              region={this.state.mapRegion}
            >
            <Marker coordinate={this.props.mylocation}>
              <View style={styles.myMarker}>
                <View style={styles.myMarkerDot} />
              </View>
            </Marker>

            {mapSpots.map(marker => (
              <Marker coordinate={{latitude: marker[0], longitude: marker[1]}}>
                {campingMarker(marker)}
              </Marker>
            ))}
          </MapView>
        }
      </View>
    );
  }

  renderTabs() {
    const { filters } = this.props;

    return (
      <View style={styles.tabs}>
        <View
          style={[styles.tab, filters.type === "all" ? styles.activeTab : null]}
        >
          <Text
            style={[
              styles.tabTitle,
              filters.type === "all" ? styles.activeTabTitle : null
            ]}
            onPress={() => this.handleTab("all")}
          >
            Toutes les stations
          </Text>
        </View>
        <View
          style={[
            styles.tab,
            filters.type === "tent" ? styles.activeTab : null
          ]}
        >
          <Text
            style={[
              styles.tabTitle,
              filters.type === "tent" ? styles.activeTabTitle : null
            ]}
            onPress={() => this.handleTab("tent")}
          >
            E85
          </Text>
        </View>
        <View
          style={[styles.tab, filters.type === "rv" ? styles.activeTab : null]}
        >
          <Text
            style={[
              styles.tabTitle,
              filters.type === "rv" ? styles.activeTabTitle : null
            ]}
            onPress={() => this.handleTab("rv")}
          >
            GPL
          </Text>
        </View>
      </View>
    );
  }

  renderList() {
    const { filters, campings } = this.props;
    const mapSpots =
      filters.type === "all"
        ? campings
        : campings.filter(camping => camping.type === filters.type);

    return mapSpots.map(camping => {
      return (
        <View style={styles.camping}>
          <Text style={{ fontSize: 28, color: "#8cc56b", fontWeight: "bold" }}>
            {camping[3]["E85"]}€
          </Text>
          <View style={styles.campingDetails}>
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "center"
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                {camping[2]}
              </Text>
              <Text style={{ fontSize: 12, color: "#A5A5A5", paddingTop: 5 }}>
                {camping[4]}
              </Text>
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View style={styles.campingInfo}>
                <Icon.FontAwesome name="star" color="#FFBA5A" size={12} />
                <Text style={{ marginLeft: 4, color: "#FFBA5A" }}>
                  {camping.rating}
                </Text>
              </View>
              <View style={styles.campingInfo}>
                <Icon.FontAwesome
                  name="location-arrow"
                  color="#FF7657"
                  size={12}
                />
                <Text style={{ marginLeft: 4, color: "#FF7657" }}>
                  {camping.distance}km
                </Text>
              </View>
              <View style={styles.campingInfo}>
                <Icon.Ionicons name="md-pricetag" color="black" size={12} />
                <Text style={{ marginLeft: 4, color: "black" }}>
                  {camping.price}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 0.2, justifyContent: "center" }}>
            <Icon.SimpleLineIcons
              name="options-vertical"
              color="#A5A5A5"
              size={24}
            />
          </View>
        </View>
      );
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.renderHeader()}
        <ScrollView style={styles.container}>
          {this.renderMap()}
          {this.renderList()}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const moduleState = state => ({
  campings: state.campings.spots,
  filters: state.campings.filters,
  mylocation: state.campings.mylocation
});

const moduleActions = {
  setLocation,
  setCampings,
  setFilters
};

export default connect(moduleState, moduleActions)(Campings);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  headerContainer: {
    top: 0,
    height: height * 0.15,
    width: width
  },
  header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.15,
    paddingHorizontal: 14
  },
  location: {
    height: 24,
    width: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7657"
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    //borderColor: "#083854"
  },
  rvMarker: {
    backgroundColor: "#FFBA5A"
  },
  tentMarker: {
    backgroundColor: "#FF7657"
  },
  settings: {
    alignItems: "center",
    justifyContent: "center"
  },
  options: {
    width: 250,
    height: 80,
    padding: 10
  },
  tabs: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end"
  },
  tab: {
    paddingHorizontal: 14,
    marginHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: "transparent"
  },
  tabTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 10
  },
  activeTab: {
    borderBottomColor: "#FF7657"
  },
  activeTabTitle: {
    color: "#FF7657"
  },
  map: {
    flex: 1
  },
  camping: {
    flex: 1,
    flexDirection: "row",
    borderBottomColor: "#A5A5A5",
    borderBottomWidth: 0.5,
    padding: 20
  },
  campingDetails: {
    flex: 2,
    paddingLeft: 20,
    flexDirection: "column",
    justifyContent: "space-around"
  },
  campingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14
  },
  campingImage: {
    width: width * 0.3,
    height: width * 0.25,
    borderRadius: 6
  },
  myMarker: {
    zIndex: 2,
    width: 60,
    height: 60,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(51, 83, 251, 0.2)"
  },
  myMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: "#3353FB"
  }
});
