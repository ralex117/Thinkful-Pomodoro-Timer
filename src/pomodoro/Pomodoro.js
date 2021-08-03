import React, { useState } from "react";
import useInterval from "../utils/useInterval";
import FocusTimer from "./FocusTimer.js";
import BreakTimer from "./BreakTimer";
import Action from "./Action";
import ProgressBar from "./ProgressBar";

// These functions are defined outside of the component to insure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  return {
    ...prevState,
    timeRemaining,
  };
}


/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [breakLeft, setBreakLeft] = useState(0);
  const [aria, setAria] = useState(0);



  // ToDo: Allow the user to adjust the focus and break duration.

  const increaseFocusTime = () => {
    if (focusDuration < 60) setFocusDuration(focusDuration + 5)
  }  

  const decreaseFocusTime = () => {
    if (focusDuration > 5) setFocusDuration(focusDuration - 5);
  }

  const increaseBreakTime = () => {
    if (breakDuration < 15) setBreakDuration(breakDuration + 1);
  }  

  const decreaseBreakTime = () => {
    if (breakDuration > 1) setBreakDuration(breakDuration - 1);
  }

  

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(() => {
    setBreakLeft(breakLeft + 1)
    if (session.timeRemaining === 0) {
      new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
      setSession(nextSession(focusDuration, breakDuration));
    }
    setSession(nextTick);    
    const left = session.timeRemaining
    if(session.label === "Focusing") {
      setAria(100*(focusDuration * 60 - left)/(focusDuration*60))
    } else {
      setAria(100*(breakDuration * 60 - left)/(breakDuration*60))
    }
    }, 
    isTimerRunning ? 1000 : null
  );


  useInterval(()=> {
  if(session && session.timeRemaining) {
    return setElapsed(elapsed + 1)
  }
  }, 1000)

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

  const stopButtonHandler = () => {
    setSession(null);
    setIsTimerRunning(false);
    setElapsed(0);
  }



  return (
    <div className="pomodoro">
      <link
        /*rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z"
        crossorigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic-bootstrap.min.css"
        integrity="sha512-UyNhw5RNpQaCai2EdC+Js0QL4RlVmiq41DkmCJsRV3ZxipG2L0HhTqIf/H9Hp8ez2EnFlkBnjRGJU2stW3Lj+w=="
        crossorigin="anonymous"*/
      />
      <div className="row">
        <div className="col">
          <FocusTimer
          focusDuration={focusDuration}
          increaseFocusTime={increaseFocusTime}
          isTimerRunning={isTimerRunning}
          decreaseFocusTime={decreaseFocusTime}
          />
        </div>
        <div className="col">
          <div className="float-right">
            <BreakTimer
            breakDuration={breakDuration}
            increaseBreakTime={increaseBreakTime}
            isTimerRunning={isTimerRunning}
            decreaseBreakTime={decreaseBreakTime}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Action
            playPause={playPause}
            isTimerRunning={isTimerRunning}
            stopButtonHandler={stopButtonHandler}
          />
        </div>
      </div>
        <ProgressBar
          aria={aria}
          breakDuration={breakDuration}
          focusDuration={focusDuration}
          session={session}
          isTimerRunning={isTimerRunning}
        />  
    </div>
  );
}

export default Pomodoro;