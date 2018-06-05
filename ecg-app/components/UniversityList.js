import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Title, List, ListItem, Icon } from "native-base";

import BoothInfo from "./BoothInfo";

export default class UniversityList extends Component {

  constructor() {
    super();
    this.state = {
      isModalShown: false,
      university: "",
      id: "",
    };
  }

  openModal(id) {
    this.setState({
      isModalShown: true,
      id
    })
  }

  closeModal() {
    this.setState({ isModalShown: false })
  }

  render() {
    let unisToDisplay = this.props.universities
    if (this.props.filteredUnis) unisToDisplay = this.props.filteredUnis;

    return (
        <View>
        {
          unisToDisplay.map((university) => {
            return <UniversitySection
              key={university.id}
              university={university}
              openModal={(i)=>this.openModal(i)}
              show={this.props.show}
            />
          })
        }
          <BoothInfo
            isModalShown={this.state.isModalShown}
            closeModal={s=>this.closeModal(s)}
            id={this.state.id}
            imagesRef={this.props.imagesRef}
            {...this.props}
          />
        </View>
    )
  }
}

class UniversitySection extends Component {
  constructor(props) {
    super(props);
    this.state = { showUni: false }
  }

  componentDidMount() {
    this.setState({ showUni: this.props.show })
  }

  static getDerivedStateFromProps(props, state) {
    // props can only open the section but cannot close it
    if (props.show && !state.showUni) return { showUni: true }
    else return {}
  }

  toggleShow() {
    this.setState({showUni: !this.state.showUni})
  }

  render() {
    let {id, name, faculties} = this.props.university;
    let iconName = this.state.showUni ? "ios-arrow-down" : "ios-arrow-back";

    // university section faculties
    let facultiesDisplay = faculties.map((faculty) => {
      return <Faculty
        key={faculty.id}
        name={faculty.name}
        openModal={()=>this.props.openModal(faculty.id)}
      />
    })

    return (
      <List>
        <ListItem
          itemDivider
          style={styles.rightIcon}
          button onPress={()=>this.props.openModal(id)}
        >
          <Text>{name}</Text>
          <Icon
            name={iconName}
            style={styles.icon}
            button onPress={()=>this.toggleShow()}
          />
        </ListItem>
        {this.state.showUni && facultiesDisplay}
      </List>
    )
  }
}

class Faculty extends Component {
  render() {
    let {name, openModal} = this.props;
    
    return (
      <ListItem button onPress={()=>openModal()}>
        <Text>{name}</Text>
      </ListItem>
    )
  }
}

const styles = StyleSheet.create({
  rightIcon: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  icon: {
    color: "grey"
  }
});