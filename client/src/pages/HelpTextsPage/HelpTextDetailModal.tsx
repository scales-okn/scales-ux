import React, { FunctionComponent, useEffect, useState } from "react";
import { useHelpTexts } from "src/store/helpTexts";

import * as yup from "yup";
import { useFormik } from "formik";
import { TextField, Button } from "@mui/material";

import ModalContainer from "src/components/Modals/ModalContainer";

import { detailStyles } from "./styles";

type FeedbackDetailModalT = {
  feedbackDetail: Record<string, unknown>;
  closeModal: () => void;
};

const FeedbackDetailModal: FunctionComponent<FeedbackDetailModalT> = ({
  closeModal,
  feedbackDetail,
}) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { updateHelpText, deleteHelpText } = useHelpTexts();
  const {
    slug,
    description,
    examples,
    options,
    links,
  }: {
    slug?: string;
    description?: string;
    examples?: string;
    options?: string;
    links?: string;
  } = feedbackDetail || {};

  const validationSchema = yup.object({
    description: yup.string().required("Description is required"),
    examples: yup.string(),
    options: yup.string(),
    links: yup.string(),
  });

  const initialValues = {
    description: description || "",
    examples: examples || "",
    options: options || "",
    links: links || "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      updateHelpText(slug, values);
      closeModal();
      formik.resetForm();
    },
  });

  useEffect(() => {
    formik.setValues(initialValues);
  }, [feedbackDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = () => {
    if (confirmVisible) {
      deleteHelpText(slug);
      setTimeout(() => {
        closeModal();
        setConfirmVisible(false);
      }, 500);
    } else {
      setConfirmVisible(true);
    }
  };

  if (!slug) return null;

  return (
    <ModalContainer open onClose={closeModal}>
      <div className={`tooltip-title ${detailStyles}`}>
        <section>
          <h5>Slug:</h5>
          <p>{slug}</p>
        </section>

        <section>
          <h5>Description:</h5>
          <TextField
            fullWidth
            multiline
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && !!formik.errors.description}
            helperText={formik.touched.description && formik.errors.description}
          />
        </section>

        <section>
          <h5>Examples:</h5>
          <TextField
            fullWidth
            multiline
            name="examples"
            value={formik.values.examples}
            onChange={formik.handleChange}
            error={formik.touched.examples && !!formik.errors.examples}
            helperText={"* Separate by !!"}
          />
        </section>

        <section>
          <h5>Options:</h5>
          <TextField
            fullWidth
            multiline
            name="options"
            value={formik.values.options}
            onChange={formik.handleChange}
            error={formik.touched.options && !!formik.errors.options}
            helperText={"* Separate by !!"}
          />
        </section>

        <section>
          <h5>Links:</h5>
          <TextField
            fullWidth
            multiline
            name="links"
            value={formik.values.links}
            onChange={formik.handleChange}
            error={formik.touched.links && !!formik.errors.links}
            helperText={"* Separate by !!"}
          />
        </section>
        <div className="buttonRow">
          <Button
            color="error"
            variant="outlined"
            onClick={handleDelete}
            sx={{
              marginRight: "12px",
            }}
          >
            {confirmVisible ? "Confirm Delete" : "Delete"}
          </Button>
          <Button variant="contained" onClick={() => formik.handleSubmit()}>
            Update
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default FeedbackDetailModal;
