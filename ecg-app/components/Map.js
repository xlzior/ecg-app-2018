import React, { Component } from "react";
import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { Container, Content, Text, Header, Body, Title, Picker, List, ListItem, Icon } from "native-base";

import ImageView from "react-native-image-view";
import UniversityList from "./UniversityList";

const {width} = Dimensions.get("window");

export default class MapView extends Component {
  constructor(props) {
    super(props);
    // TODO: put this on firebase instead
    this.state = {
      locations: [
        {
          id: "hall",
          name: "Hall",
          fileName: "hall.png"
        },
        {
          id: "dl2",
          name: "Block D Level 2",
          fileName: "dl2.png"
        },
        {
          id: "dl3",
          name: "Block D Level 3",
          fileName: "dl3.png"
        },
      ],
      location: "Hall",
      isImageOpen: false,
      universities: []
    }
  }

  getURL(e) {
    // get image download URLs from firebase and store inside this.images
    var imageRef = this.props.imagesRef.child(e.fileName);
    var locations = this.state.locations.slice();
    var index = locations.indexOf(e);

    imageRef.getDownloadURL()
    .then(url => {
      locations[index].source = {
        uri: url,
        cache: "force-cache"
      };
      locations[index].width = 1920;
      locations[index].height = 1080;
      this.setState({locations})
    })
    .catch(e => console.error("Error getting map URLs", e));
  }

  componentDidMount() {
    // get URLs for all the locations
    this.state.locations.forEach(e => this.getURL(e));
  }

  static getDerivedStateFromProps(props, state) {
    var locations = state.locations.slice();
    for (let locationName in props.FBmap) {
      // for each location in the map
      var location = state.locations.find(l => l.name == locationName);
      var index = locations.indexOf(location);

      // compile a list of boothIds in the location
      var boothIds = []
      for (let uni in props.FBmap[locationName]) {
        var uniSection = [uni, ...props.FBmap[locationName][uni].split(", ")]
        boothIds.push(...uniSection);
      }

      // add the info to the existing object called locations
      locations[index].boothIds = boothIds;
    }
    if (props.location !== "") {
      return {
        universities: props.universities,
        locations,
        location: props.location
      }
    }
    return {
      universities: props.universities,
      locations
    }
  }

  changeLocation(location) {
    this.setState({location})
  }

  render() {
    var {universities, locations, location, isImageOpen} = this.state;
    var {FBmap, FBuniversity, FBfaculty, imagesRef, openMap} = this.props;
    // generate map
    var image = locations.find(e => e.name == location);
    var imageIndex = locations.indexOf(image);
    
    if (image && image.source) { // image.source.uri might not exist if the download URL has not been fetched from firebase
      var imageDisplay = (
        <View>
          <TouchableOpacity onPress={()=>this.setState({isImageOpen: true})}>
            <Image
              source={{
                uri: image.source.uri,
                cache: "force-cache"
              }}
              style={{height: 200, width}}
            />
          </TouchableOpacity>
          <ImageView
            images={locations}
            imageIndex={imageIndex}
            isVisible={isImageOpen}
            onClose={()=>this.setState({isImageOpen: false})}
            renderFooter={()=><Text>{image.name}</Text>}
          />
        </View>
      )
    }

    // generate items for the dropdown menu
    let pickerItems = locations.map(e => <Picker.Item key={e.id} label={e.name} value={e.name}/>)

    // generate university list by filtering for unis in the selected location
    var filteredUnis = [];
    if (universities && universities.length > 0) {
      universities.forEach(uni => {
        var filteredFacs = uni.faculties.filter(fac => {
          var boothIds = locations.find(l => l.name == location).boothIds;
          if (boothIds) return boothIds.indexOf(fac.id) != -1;
        });
        if (filteredFacs.length > 0) {
          filteredUnis.push({
            id: uni.id,
            name: uni.name,
            faculties: filteredFacs
          })
        }
      })
    }

    return (
      <Container>
        <Header>
          <Body>
            <Title>Map</Title>
          </Body>
        </Header>
        <Content>
          <Picker
            selectedValue={location}
            iosHeader="Select location"
            mode="dropdown"
            iosIcon={<Icon name="ios-arrow-down-outline" />}
            onValueChange={id => this.changeLocation(id)}>
            {pickerItems}
          </Picker>
          {imageDisplay}
          <UniversityList
            universities={universities}
            filteredUnis={filteredUnis}
            FBmap={FBmap}
            FBuniversity={FBuniversity}
            FBfaculty={FBfaculty}
            imagesRef={imagesRef}
            openMap={l=>openMap(l)}
            show={true}
          />
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({});