import React, { memo } from 'react';
import * as yup from 'yup';
import _ from 'lodash-es';
import { useFormik } from 'formik';

import { Button, TextField } from '@material-ui/core';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { useTranslation } from 'config/i18n';

import { INameAndDescriptionCardProps } from '.';

import './NameAndDescriptionCard.scss';

function NameAndDescriptionCard({
  title = 'Run Properties',
  defaultName,
  defaultDescription,
  onSave,
}: INameAndDescriptionCardProps): React.FunctionComponentElement<React.ReactNode> {
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: {
      name: defaultName ?? '',
      description: defaultDescription ?? '',
    },
    onSubmit: _.noop,
    validationSchema: yup.object({
      name: yup.string().required(
        t('nameAndDescriptionCard.nameRequired', {
          defaultValue: 'Name is a required field',
        }),
      ),
    }),
  });

  const { values, errors, touched, setFieldValue, setFieldTouched } = formik;

  function onChange(e: React.ChangeEvent<any>, fieldName: string) {
    setFieldValue(fieldName, e?.target?.value, true).then(() => {
      setFieldTouched(fieldName, true);
    });
  }

  function saveHandler() {
    onSave(values.name, values.description);
  }

  return (
    <ErrorBoundary>
      <div className='NameAndDescriptionCard'>
        <div className='NameAndDescriptionCard__header'>
          <Text component='h4' weight={600} size={14} tint={100}>
            {title === 'Run Properties'
              ? t('nameAndDescriptionCard.defaultTitle', {
                  defaultValue: 'Run Properties',
                })
              : title}
          </Text>
          <Button
            onClick={saveHandler}
            disabled={
              !_.isEmpty(errors) ||
              (values.name === defaultName &&
                values.description === defaultDescription)
            }
            variant='contained'
            color='primary'
            className='NameAndDescriptionCard__saveBtn'
          >
            {t('nameAndDescriptionCard.save', { defaultValue: 'Save' })}
          </Button>
        </div>
        <div className='NameAndDescriptionCard__content'>
          <div className='NameAndDescriptionCard__content__nameBox'>
            <TextField
              variant='outlined'
              className='TextField__OutLined__Medium NameAndDescriptionCard__content__nameBox__nameInput'
              value={values.name}
              onChange={(e) => onChange(e, 'name')}
              error={!!(touched.name && errors.name)}
              helperText={touched.name && errors.name}
              label={t('nameAndDescriptionCard.name', { defaultValue: 'Name' })}
            />
          </div>
          <div className='NameAndDescriptionCard__content__descriptionBox'>
            <TextField
              variant='outlined'
              multiline
              label={t('nameAndDescriptionCard.description', {
                defaultValue: 'Description',
              })}
              type='textarea'
              className='NameAndDescriptionCard__content__descriptionBox__descriptionInput'
              value={values.description}
              onChange={(e) => onChange(e, 'description')}
              error={!!(touched.description && errors.description)}
              helperText={touched.description && errors.description}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default memo(NameAndDescriptionCard);
