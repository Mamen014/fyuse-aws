import boto3
import sagemaker
import pandas as pd

s3_bucket = "fyuse-images"  # Change to your bucket name
s3_key = "mapped_data.csv"
s3_path = f"s3://{s3_bucket}/{s3_key}"

role = "arn:aws:iam::586794474562:role/SageMakerExecutionRole"
sess = sagemaker.Session()

from sagemaker.estimator import Estimator

container = sagemaker.image_uris.retrieve("xgboost", sess.boto_region_name, "1.5-1")

xgb_estimator = Estimator(
    container,
    role=role,
    instance_count=1,
    instance_type="ml.m5.large",
    output_path=f"s3://{s3_bucket}/models/",
    sagemaker_session=sess
)

xgb_estimator.set_hyperparameters(
    objective="multi:softmax",  # Multi-class classification
    num_class=6,  # Adjust based on number of output categories
    num_round=100
)

xgb_estimator.fit({"train": s3_path})

xgb_predictor = xgb_estimator.deploy(
    initial_instance_count=1,
    instance_type="ml.m5.large"
)
