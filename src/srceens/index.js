import React, { Component } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Image
} from 'react-native';
import * as Permissions from 'expo-permissions';
import * as Contacts from 'expo-contacts';
import { get, map } from 'lodash';

import ListItem from '../components/ListItem';
import Avatar from '../components/Avatar';

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      contacts: []
    };
  }

  async componentWillMount() {
    const { status } = await Permissions.getAsync(Permissions.CONTACTS);
    if (status !== 'granted') {
      await Permissions.askAsync(Permissions.CONTACTS);
    } else {
      this.loadContacts();
    }
  }

  async loadContacts() {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Emails]
    });
    if (data.length > 0) {
      console.log(data, 'data');
      this.setState({ contacts: data });
      this.setState({ searchPlaceholder: `Search ${data.length} contacts` });
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            paddingLeft: 100,
            paddingRight: 100,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              padding: 5,
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            {' '}
            Rn-Contact
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {map(this.state.contacts, (contact, index) => {
            return (
              <ListItem
                key={index}
                leftElement={
                  <Avatar
                    img={
                      contact.imageAvailable
                        ? { uri: contact.image }
                        : undefined
                    }
                    placeholder={getAvatarInitials(
                      `${get(contact, 'firstName', '')} ${get(
                        contact,
                        'lastName',
                        ''
                      )}`
                    )}
                    width={40}
                    height={40}
                  />
                }
                key={contact.id}
                title={`${get(contact, 'firstName', '')} ${get(
                  contact,
                  'lastName',
                  ''
                )}`}
                description={`${get(contact, 'company', '')}`}
                onPress={async () => {
                  await Contacts.presentFormAsync(contact.id);
                  this.loadContacts();
                }}
                onDelete={async () => {
                  await Contacts.removeContactAsync(contact.id);
                  this.loadContacts();
                }}
              />
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const getAvatarInitials = textString => {
  if (!textString) return '';

  const text = textString.trim();

  const textSplit = text.split(' ');

  if (textSplit.length <= 1) return text.charAt(0);

  const initials =
    textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0);

  return initials;
};
