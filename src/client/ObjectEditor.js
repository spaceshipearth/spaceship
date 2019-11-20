import React from  "react";
import gql from "graphql-tag";
import {
  InputLabel,
  FormControl,
  Button,
  Box,
} from "@material-ui/core";
import { useMutation } from "react-apollo";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Editor, EditorState, ContentState, RichUtils, convertFromHTML } from "draft-js";
import {stateToHTML} from 'draft-js-export-html';

// Wrap DraftJS in a MaterialUI FormControl to make it
// interchangeable with a TextField
function DraftJSTextField({ margin, fullWidth, label, name, value, onChange}) {
  //
  const blocksFromHTML = convertFromHTML(value);
  const contentState = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );

  const [editorState, setEditorState] = React.useState(
    EditorState.createWithContent(contentState)
  );

  function handleChange(newEditorState) {
    setEditorState(newEditorState);
    if (onChange) {
      onChange({target: {name, value:stateToHTML(newEditorState.getCurrentContent())}});
    }
  }

  const editorFocused = editorState.getSelection().getHasFocus();
  return (
    <FormControl fullWidth={fullWidth} margin={margin}>
      <InputLabel
        shrink={editorFocused || editorState.getCurrentContent().hasText()}
        focused={editorFocused}
      >
        {label}
      </InputLabel>
      <Box
        style={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
          zIndex: 1,
          marginTop: 16,
          paddingBottom: 8,
          fontSize: 16
        }}
      >
        <Editor editorState={editorState} onChange={handleChange} />
      </Box>
    </FormControl>
  );
}

// General purpose DB object editor in a Dialog
// We can leverage this in the future to let users define own goals
// `fields` specifies the shape of the object (see CategoryEditor)
function ObjectEditor({title, object, fields, upsertMutation}) {
  const [open, setOpen] = React.useState(false);
  // fieldsState is a dict that tracks the object as it's edited
  const [fieldsState, setFieldsState] = React.useState(object || {});
  const [upsertObject] = useMutation(upsertMutation);

  // when one of the fields changes, we update fieldsState
  function onFieldChange(event) {
    const { target: { name, value } } = event;
    const update = {};
    update[name] = value;
    const newFieldsState = { ...fieldsState, ...update };
    setFieldsState(newFieldsState);
  }

  function handleSave() {
    upsertObject({ variables: fieldsState });
    setOpen(false);
  }

  function handleClickOpen () {
    setOpen(true);
  };
  function handleClose () {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        edit
      </Button>
      <Dialog open={open} onClose={handleClose} aria-label={title}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {fields.map((fieldInfo, idx) =>
            fieldInfo.type == "richtext" ? (
              <DraftJSTextField
                key={fieldInfo.name}
                name={fieldInfo.name}
                label={fieldInfo.label}
                value={fieldsState[fieldInfo.name]}
                margin="denser"
                onChange={onFieldChange}
                fullWidth
              />
            ) : (
              <TextField
                key={fieldInfo.name}
                autoFocus={idx == 0}
                margin="dense"
                name={fieldInfo.name}
                label={fieldInfo.label}
                type={fieldInfo.type}
                fullWidth
                value={fieldsState[fieldInfo.name]}
                onChange={onFieldChange}
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export function CategoryEditor({ category }) {
  const upsertCategoryMutation = gql`
    mutation UpsertCategory(
      $id: ID
      $title: String
      $shortDescription: String
      $longDescription: String
      $displayRank: Int
    ) {
      upsertCategory(
        id: $id
        title: $title
        shortDescription: $shortDescription
        longDescription: $longDescription
        displayRank: $displayRank
      ) {
        id
        title
        shortDescription
        longDescription
        displayRank
      }
    }
  `;

  return (
    <ObjectEditor
      title="Edit Category"
      object={category}
      upsertMutation={upsertCategoryMutation}
      fields={[
        { name: "id", label: "Human readable id" },
        { name: "title", label: "Title" },
        { name: "shortDescription", label: "Short Description" },
        {
          name: "longDescription",
          label: "Long Description",
          type: "richtext"
        },
        { name: "displayRank", label: "Rank", type: "number" }
      ]}
    />
  );
}


export function GoalEditor({ goal }) {
  const upsertGoalMutation = gql`
    mutation UpsertGoal(
      $id: ID
      $title: String
      $shortDescription: String
      $longDescription: String
      $categoryId: ID
      $displayRank: Int
    ) {
      upsertGoal(
        id: $id
        title: $title
        shortDescription: $shortDescription
        longDescription: $longDescription
        categoryId: $categoryId
        displayRank: $displayRank
      ) {
        id
        title
        shortDescription
        longDescription
        categoryId
        displayRank
      }
    }
  `;

  return (
    <ObjectEditor
      title="Edit Goal"
      object={goal}
      upsertMutation={upsertGoalMutation}
      fields={[
        { name: "id", label: "Human readable id" },
        { name: "title", label: "Title" },
        { name: "shortDescription", label: "Short Description" },
        {
          name: "longDescription",
          label: "Long Description",
          type: "richtext"
        },
        { name: "categoryId", label: "Category Id" },
        { name: "displayRank", label: "Rank", type: "number" }
      ]}
    />
  );
       }