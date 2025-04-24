function generateAvailableSlots({
  startTime,
  endTime,
  startBreakTime,
  endBreakTime,
  bookings,
  duration,
  minimumSlotTime,
  bookingBreak,
}: any) {
  console.log({
    startTime,
    endTime,
    startBreakTime,
    endBreakTime,
    bookings,
    duration,
    minimumSlotTime,
    bookingBreak,
  });
  function convertToDate(time: any) {
    // console.log('time', time);
    // console.log({ time });
    const [timeStr, period] = time?.split(' ');
    // console.log({ timeStr });
    // console.log({ period });
    const [hours, minutes] = timeStr?.split(':').map(Number);
    // console.log({ hours });
    // console.log({ minutes });
    // // console.log({ hours, minutes });
    const formattedTime = new Date();

    // Handle AM/PM conversion
    if (period === 'AM') {
      // console.log('period AM', period);
      if (hours === 12) {
        formattedTime.setHours(hours + 12);
      } else {
        formattedTime.setHours(hours);
      }
    } else {
      if (hours === 12) {
        formattedTime.setHours(hours);
      } else {
        formattedTime.setHours(hours + 12);
      }
    }
    formattedTime.setMinutes(minutes);
    return formattedTime;
  }

  function generateTimeSlots(start: any, end: any, minSlotDuration: any) {
    // console.log('start', start);
    // console.log('end', end);
    const slots = [];
    let currentTime = convertToDate(start);
    const endTime = convertToDate(end);

    // console.log({ currentTime });
    // console.log({ endTime });

    // Generate slots based on minimum slot time
    while (currentTime < endTime) {
      const nextTime = new Date(currentTime.getTime());
      // console.log({ nextTime });
      nextTime.setMinutes(currentTime.getMinutes() + minSlotDuration);

      // console.log({ nextTime });

      if (nextTime <= endTime) {
        slots.push(
          `${currentTime.getHours() < 13 ? currentTime.getHours() : currentTime.getHours() - 12}:${String(currentTime.getMinutes()).padStart(2, '0')} ${currentTime.getHours() < 12 ? 'AM' : 'PM'}`,
        );
      }

      currentTime = nextTime;
    }
    return slots;
  }

  // Generate all possible slots between startTime and endTime
  const allSlots = generateTimeSlots(startTime, endTime, minimumSlotTime);

  // console.log({ allSlots });
  let breakStart:any;
  let breakEnd:any;
  // Convert break times and bookings to comparable date objects
  if (startBreakTime && endBreakTime) {
     breakStart = convertToDate(startBreakTime);

    // console.log({ breakStart });
     breakEnd = convertToDate(endBreakTime);
  }

  /////////////
  // const breakStart = convertToDate(startBreakTime);

  // // console.log({ breakStart });
  // const breakEnd = convertToDate(endBreakTime);
  /////////////

  // console.log({ breakEnd });

  // console.log('booking utils function', bookings);

  const bookedSlots = bookings.map((booking: any) => {
    // console.log('bookingStartTime', booking.bookingStartTime);
    return {
      start: convertToDate(booking.bookingStartTime),
      end: convertToDate(booking.bookingEndTime),
    };
  });

  // console.log('.........1............');
  // console.log('bookedSlots', bookedSlots);
  // console.log('.........2............');

  // // console.log(bookedSlots);
  // console.log('convertToDate endTime');
  // console.log(convertToDate(endTime));

  // Filter out slots that are already booked or fall within break time

  const availableSlots = allSlots.filter((slot, i) => {
    // console.log('.........1............');
    // console.log(slot);
    // console.log('.........2............');
    const slotStart = convertToDate(slot);
    const slotEnd = new Date(slotStart.getTime());
    slotEnd.setMinutes(slotStart.getMinutes() + duration - 1);

    // // console.log('.........start............');
    // // console.log({ slotStart });
    // // console.log({ breakStart });
    // // console.log({ slotEnd });
    // // console.log(convertToDate(endTime));
    // // console.log({ breakEnd });
    // // console.log('.........end............');

    // Check if the slot is during the break time
    
    if (breakStart && breakEnd && slotStart >= breakStart && slotStart <= breakEnd) {
      // // console.log('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttt');
      return false; // Slot is during break time
    }

    const isBooked = bookedSlots.find(
      (booking: any) =>
        (slotStart >= booking.start && slotStart < booking.end) ||
        (slotEnd > booking.start && slotEnd <= booking.end),
    );

    // console.log({ slotStart });
    // console.log({ isBooked });
    // console.log({ slotEnd });

    if (isBooked) {
      return false; // Slot is already booked
    }

    const violatesBreak = bookedSlots.find(
      (booking: any) =>
        slotStart >= booking.end &&
        slotStart < new Date(booking.end.getTime() + bookingBreak * 60000),
    );
    // console.log({ violatesBreak });

    if (violatesBreak) {
      return false;
    }

    if (slotEnd > convertToDate(endTime)) {
      return false;
    }

    return true;
  });

  //   // console.log(availableSlots);

  return availableSlots;
}

export { generateAvailableSlots };

function convertToMinutes(time: string): number {
  const [hours, minutes, period] = time.split(/[:\s]+/);
  let totalMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  if (period.toUpperCase() === 'PM' && parseInt(hours, 10) !== 12) {
    totalMinutes += 12 * 60; // Convert PM times to 24-hour format
  }
  if (period.toUpperCase() === 'AM' && parseInt(hours, 10) === 12) {
    totalMinutes -= 12 * 60; // Convert 12 AM to 0:00 hours
  }
  return totalMinutes;
}

export { convertToMinutes };

function isTimeOverlap(
  mentorStart: string,
  mentorEnd: string,
  queryStart: string,
  queryEnd: string,
): boolean {
  const mentorStartMinutes = convertToMinutes(mentorStart);
  const mentorEndMinutes = convertToMinutes(mentorEnd);
  const queryStartMinutes = convertToMinutes(queryStart);
  const queryEndMinutes = convertToMinutes(queryEnd);

  // Check if the times overlap
  return (
    mentorStartMinutes < queryEndMinutes && mentorEndMinutes > queryStartMinutes
  );
}

export { isTimeOverlap };

/// filter query business
export function generateNewTimeSlot(timeSlots: string[]): string {
  // console.log("------",{ timeSlots });
  // Convert time ranges into an array of start and end times
  // const parsedSlots = timeSlots.map((slot) => {
  //   const [start, end] = slot?.split(' - ');
  //   return { start, end };
  // });

  const parsedSlots = timeSlots
    .filter((slot) => typeof slot === 'string' && slot.includes(' - ')) // Validate slots
    .map((slot) => {
      const [start, end] = slot.split(' - ');
      return { start, end };
    });

  if (parsedSlots.length === 0) {
    throw new Error('No valid time slots provided.');
  }

  // console.log({ parsedSlots });

  // Find the earliest start time
  const earliestStart = parsedSlots.reduce((earliest, current) =>
    new Date(`1970-01-01T${convertTo24Hour(current.start)}`) <
    new Date(`1970-01-01T${convertTo24Hour(earliest.start)}`)
      ? current
      : earliest,
  ).start;

  // Find the latest end time
  const latestEnd = parsedSlots.reduce((latest, current) =>
    new Date(`1970-01-01T${convertTo24Hour(current.end)}`) >
    new Date(`1970-01-01T${convertTo24Hour(latest.end)}`)
      ? current
      : latest,
  ).end;

  // Return the combined time slot
  return `${earliestStart} - ${latestEnd}`;
}

// Helper function to convert 12-hour time to 24-hour time for comparison
function convertTo24Hour(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2}) (AM|PM)/);

  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const [hours, minutes, period] = match.slice(1);
  let hour = parseInt(hours, 10);

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

export function getDayDate(dayName: string) {
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const today = new Date();
  const currentDayIndex = today.getDay();
  const targetDayIndex = daysOfWeek.indexOf(dayName);

  let daysUntilTarget = targetDayIndex - currentDayIndex;
  // if (daysUntilTarget <= 0) {
  //   daysUntilTarget += 7; // Get the next occurrence of the day
  // }

  today.setDate(today.getDate() + daysUntilTarget);

  // Format the date as DD/MM/YYYY
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = today.getFullYear();

  // return `${day}/${month}/${year}`;
  return `${year}-${month}-${day}`;
}

// const formattedDate = getNextDayDate("Monday");
// // console.log(formattedDate); // Logs the next Monday's date in DD/MM/YYYY format
