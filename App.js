import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

// import { Piano } from "react-native-piano";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import Standard from "./Standard";

function Balls() {
  const [btnVal, setBtnVal] = useState(false);
  const { height, width } = useWindowDimensions();
  const isPressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const moveDirection = useSharedValue("none");
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? "yellow" : "blue",
    };
  });
  const [itemRegisterUS, setItemRegisterUS] = useState({
    d0: false,
    d1: false,
    d2: false,
    d3: false,
    d4: false,
    d5: false,
    d6: false,
  });

  const itemRegister = useSharedValue(itemRegisterUS);
  const divPortion = width / Object.keys(itemRegister.value).length;

  const animatedStylesd0 = useAnimatedStyle(() => {
    return {
      width: divPortion,
      height: divPortion,
      backgroundColor: !itemRegister.value.d0 ? "white" : "darksalmon",
    };
  });
  const animatedStylesd1 = useAnimatedStyle(() => {
    return {
      width: divPortion,
      height: divPortion,
      backgroundColor: !itemRegister.value.d1 ? "white" : "darksalmon",
    };
  });
  const animatedStylesd2 = useAnimatedStyle(() => {
    return {
      width: divPortion,
      height: divPortion,
      backgroundColor: !itemRegister.value.d2 ? "white" : "darksalmon",
    };
  });
  const animatedStylesd3 = useAnimatedStyle(() => {
    return {
      width: divPortion,
      height: divPortion,
      backgroundColor: !itemRegister.value.d3 ? "white" : "darksalmon",
    };
  });
  const animatedStylesd4 = useAnimatedStyle(() => {
    return {
      width: divPortion,
      height: divPortion,
      backgroundColor: !itemRegister.value.d4 ? "white" : "darksalmon",
    };
  });
  const animatedStylesd5 = useAnimatedStyle(() => {
    return {
      width: divPortion,
      height: divPortion,
      backgroundColor: !itemRegister.value.d5 ? "white" : "darksalmon",
    };
  });
  const animatedStylesd6 = useAnimatedStyle(() => {
    return {
      width: divPortion,
      height: divPortion,
      backgroundColor: !itemRegister.value.d6 ? "white" : "darksalmon",
    };
  });

  const numberSign = (num) => {
    "worklet";
    return num === 0 ? 0 : num / Math.abs(num);
  };
  const isInNoRange = (num, lb, ub) => {
    "worklet";
    return lb <= num && num < ub;
  };
  const start = useSharedValue({ x: 0, y: 0 });
  const newStartTouch = useSharedValue({ x: 0, y: 0 });
  const startBlockStatus = useSharedValue({ pos: -1, truthValue: false });
  const furthestBlockDistanceOut = useSharedValue(0);
  const prevDirection = useSharedValue("none");

  const findIntervalNum = (num) => {
    "worklet";
    for (let i = 0; i < Object.keys(itemRegister.value).length; i++) {
      if (isInNoRange(num, i * divPortion, (i + 1) * divPortion)) {
        return i;
      }
    }
  };
  const findInterval = (num) => {
    "worklet";
    return `d${findIntervalNum(num)}`;
  };
  const updateItemRegister = (pos, value) => {
    "worklet";
    value = value !== undefined ? value : !itemRegister.value[pos];
    // console.log(`Changing ${pos} to ${value}`);
    itemRegister.value = {
      ...itemRegister.value,
      ...JSON.parse(`{"${pos}" :  ${value}}`),
    };
  };

  const updateBtnValState = () => {
    "worklet";
    setBtnVal(itemRegister.value.d0);
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      isPressed.value = true;
      newStartTouch.value = { x: e.x, y: e.y };
      console.log(
        `Started moving, at (${newStartTouch.value.x}, ${newStartTouch.value.y})`
      );
      //console.log(findInterval(e.x));
      updateItemRegister(findInterval(e.x));
      startBlockStatus.value = {
        pos: findIntervalNum(e.x),
        truthValue: itemRegister.value[findInterval(e.x)],
      };
      console.log(startBlockStatus.value);
      // runOnJS(setItemRegisterUS(itemRegister.value));
      // console.log(itemRegister.value);
      // console.log(Object.keys(itemRegister.value).length);
      //console.log(itemRegister.value[`${findInterval(e.x)}`]);
    })
    .onUpdate((e) => {
      // add newStartTouch.x + e.translationX to get the current x location (similar for y-location)
      const blocksMoved = Math.floor(Math.abs(e.translationX) / divPortion);
      moveDirection.value =
        e.translationX > 0 ? "right" : e.translationX < 0 ? "left" : "none";

      furthestBlockDistanceOut.value =
        moveDirection.value === prevDirection.value
          ? Math.max(furthestBlockDistanceOut.value, blocksMoved)
          : 0;

      console.log(
        `Moved ${blocksMoved} block(s) ${
          moveDirection.value !== "none" && moveDirection.value
        } from block ${
          startBlockStatus.value.pos
        }, furthest block dist out was ${
          furthestBlockDistanceOut.value
        }, change blocks ${startBlockStatus.value.pos} to ${
          startBlockStatus.value.pos + blocksMoved * numberSign(e.translationX)
        }`
      );
      if (moveDirection.value === "right") {
        for (let i = 1; i <= furthestBlockDistanceOut.value; i++) {
          const currentBlockPos = startBlockStatus.value.pos + i;

          if (i <= blocksMoved) {
            // console.log(`Imagine changing block ${currentBlockPos}`);
            updateItemRegister(
              `d${currentBlockPos}`,
              startBlockStatus.value.truthValue
            );
          } else {
            // console.log(`Revert block ${currentBlockPos} tho, to ${!startBlockStatus.value.truthValue}`);
            updateItemRegister(
              `d${currentBlockPos}`,
              !startBlockStatus.value.truthValue
            );
          }
        }
      } else if (moveDirection.value === "left") {
        for (let i = 1; i <= furthestBlockDistanceOut.value; i++) {
          const currentBlockPos = startBlockStatus.value.pos - i;
          // console.log(`Imagine changing block ${currentBlockPos}`);
          if (i <= blocksMoved) {
            // console.log(`Imagine changing block ${currentBlockPos}`);
            updateItemRegister(
              `d${currentBlockPos}`,
              startBlockStatus.value.truthValue
            );
          } else {
            // console.log(`Revert block ${currentBlockPos} tho, to ${!startBlockStatus.value.truthValue}`);
            updateItemRegister(
              `d${currentBlockPos}`,
              !startBlockStatus.value.truthValue
            );
          }
        }
      }
      prevDirection.value = moveDirection.value;
      /*
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
      if (Math.hypot(e.translationX, e.translationY) > 75) {
        console.log(
          `Long move (${Math.hypot(
            e.translationX,
            e.translationY
          )}, ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}.${new Date().getMilliseconds()})`
        );
      }
      */
    })
    .onEnd(() => {
      /*
      start.value = {
        // replace the "original" position with the new one
        x: offset.value.x,
        y: offset.value.y,
      };
      */
    })
    .onFinalize((e) => {
      isPressed.value = false;
      console.log(`Finished move, at (${e.x}, ${e.y})\nx`);
      moveDirection.value = "none";
      prevDirection.value = "none";
      furthestBlockDistanceOut.value = 0;
    });

  return (
    <>
      {/* <GestureHandlerRootView> */}
      <GestureDetector gesture={gesture}>
        <>
          <View style={{ flexDirection: "row" }}>
            {/* <Animated.View style={[styles.ball, animatedStyles]} /> */}
            <View style={{ flex: 1, backgroundColor: "red" }}>
              {/* <Text style={{ color: "white" }}>0 ({`${itemRegisterUS.d0}`})</Text> */}
              <Animated.View style={[styles.ball, animatedStylesd0]} />
            </View>
            <View style={{ flex: 1, backgroundColor: "green" }}>
              {/* <Text style={{ color: "white" }}>1 ({`${itemRegisterUS.d1}`})</Text> */}
              <Animated.View style={[styles.ball, animatedStylesd1]} />
            </View>
            <View style={{ flex: 1, backgroundColor: "pink" }}>
              {/* <Text>2 ({`${itemRegisterUS.d2}`})</Text> */}
              <Animated.View style={[styles.ball, animatedStylesd2]} />
            </View>
            <View style={{ flex: 1, backgroundColor: "yellow" }}>
              {/* <Text>3 ({`${itemRegisterUS.d3}`})</Text> */}
              <Animated.View style={[styles.ball, animatedStylesd3]} />
            </View>
            <View style={{ flex: 1, backgroundColor: "brown" }}>
              {/* <Text style={{ color: "white" }}>4 ({`${itemRegisterUS.d4}`})</Text> */}
              <Animated.View style={[styles.ball, animatedStylesd4]} />
            </View>
            <View style={{ flex: 1, backgroundColor: "black" }}>
              {/* <Text style={{ color: "white" }}>5 ({`${itemRegisterUS.d5}`})</Text> */}
              <Animated.View style={[styles.ball, animatedStylesd5]} />
            </View>
            <View style={{ flex: 1, backgroundColor: "darkolivegreen" }}>
              {/* <Text>6 ({`${itemRegisterUS.d6}`})</Text> */}
              <Animated.View style={[styles.ball, animatedStylesd6]} />
            </View>
          </View>
          <View>
            <Button onPress={() => setBtnVal(!btnVal)} title="Press me" />
            {/*
            <Button
              onPress={() => {
                console.log("You pressed?");
              }}
              title="Press me 2"
            />
            */}
            <Text>The button is {itemRegister.value.d0 ? "on" : "off"}</Text>
          </View>
        </>
      </GestureDetector>
      {/* </GestureHandlerRootView> */}
    </>
  );
}

export default function App() {
  return (
    <View style={{ ...styles.container, flexDirection: "column" }}>
      <Balls />
      {/* <Standard /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  ball: {
    borderRadius: 100,
    backgroundColor: "white",
    alignSelf: "center",
    borderColor: "yellow",
  },
});
