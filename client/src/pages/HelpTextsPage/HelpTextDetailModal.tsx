import React, { FunctionComponent, useEffect, useState } from "react";
import { useHelpTexts } from "store/helpTexts";

import * as yup from "yup";
import { useFormik } from "formik";
import { Button } from "react-bootstrap";
import { TextField } from "@mui/material";

import ModalContainer from "components/Modals/ModalContainer";

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
  const { slug, description, examples, options, links } = feedbackDetail || {};

  const validationSchema = yup.object({
    description: yup.string().required("Description is required"),
    examples: yup.string().required("Examples are required"),
    options: yup.string().required("Options are required"),
    links: yup.string().required("Links are required"),
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
            helperText={"* Separate by comma"}
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
            helperText={"* Separate by comma"}
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
            helperText={"* Separate by comma"}
          />
        </section>
        <div className="buttonRow">
          <Button variant="danger" onClick={handleDelete}>
            {confirmVisible ? "Confirm Delete" : "Delete"}
          </Button>
          <Button variant="primary" onClick={() => formik.handleSubmit()}>
            Update
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default FeedbackDetailModal;
