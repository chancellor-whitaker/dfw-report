import { instructional_mode_array } from "../constants/instructional_mode_array";
import { schedule_type_array } from "../constants/schedule_type_array";
import { crse_college_array } from "../constants/crse_college_array";
import { instructor_array } from "../constants/instructor_array";
import { crse_dept_array } from "../constants/crse_dept_array";
import { subject_array } from "../constants/subject_array";
import { course_array } from "../constants/course_array";
import { status_array } from "../constants/status_array";
import { crn_array } from "../constants/crn_array";

const transformationDefs = {
  instructor: {
    valueGetter: (index, values) => {
      const { first_name, last_name, id } = values[index];

      return [id, "-", first_name, last_name].join(" ");
    },
    values: instructor_array,
  },
  instructional_mode: { values: instructional_mode_array },
  schedule_type: { values: schedule_type_array },
  crse_college: { values: crse_college_array },
  crse_dept: { values: crse_dept_array },
  subject: { values: subject_array },
  course: { values: course_array },
  status: { values: status_array },
  crn: { values: crn_array },
};

const defaultValueGetter = (index, values) => values[index];

const transformRow = (row) => {
  return Object.fromEntries(
    Object.entries(row).map((entry) => {
      const [column, value] = entry;

      if (!(column in transformationDefs)) return entry;

      const { valueGetter, values } = transformationDefs[column];

      const transformedValue =
        "valueGetter" in transformationDefs[column]
          ? valueGetter(value, values)
          : defaultValueGetter(value, values);

      return [column, transformedValue];
    })
  );
};

export const transformData = (data) =>
  [data]
    .filter((element) => element)
    .flat()
    .map(transformRow);
