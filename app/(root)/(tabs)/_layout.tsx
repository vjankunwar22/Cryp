import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
 {/*Create property for the new tab*/}

   <NativeTabs.Trigger name= "saved">
        <Icon sf="bookmark.fill" />
        <Label>Saved</Label>    
   </NativeTabs.Trigger>
   
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.circle" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>


    </NativeTabs>
  );
}
