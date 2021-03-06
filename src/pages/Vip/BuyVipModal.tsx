import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Form, Radio, message, Modal, Select } from 'antd';
import * as api from './api';
import { StoreContext } from '../../index';
import { PAY_ROUTES } from '../../utils/dict';
import { openNewWidowWithHTML } from '../../utils';
import { AxiosResponse } from 'axios';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSuccess?: (response: AxiosResponse) => void;
  onCancel?: () => void;
};
type VipPurchase = {
  days: number;
  id: number;
  level: number;
  name: string;
  price: number;
};
const BuyVipModal: React.FC<Props> = ({ visible, setVisible, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { state } = useContext(StoreContext);
  const [vipPurchase, setVipPurchase] = useState<VipPurchase[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const onFinish = useCallback(
    async (formData) => {
      const currentVip = vipPurchase.find((item) => item.id === formData.vipType);
      const currentPay = PAY_ROUTES.find((item) => item.payRoute === formData.payRoute);
      setConfirmLoading(true);
      const hide = message.loading('正在获取购买信息...');
      const response = await api.orderVip({ vipLevelId: currentVip!.id, payRoute: currentPay!.payRoute, tradeType: currentPay!.tradeType }).finally(() => {
        setConfirmLoading(false);
        hide();
      });
      setVisible(false);
      onSuccess && onSuccess(response);
      openNewWidowWithHTML(response.data);
    },
    [vipPurchase, setVisible, onSuccess]
  );
  const getVipPurchase = useCallback(async () => {
    const { data } = await api.getVipPurchase();
    setVipPurchase(data);
  }, []);
  const handleCancel = useCallback(() => {
    setVisible(false);
    onCancel && onCancel();
  }, [onCancel, setVisible]);
  useEffect(() => {
    if (visible) getVipPurchase();
  }, [visible, getVipPurchase]);
  return (
    <Modal title="VIP年费会员开通/续费" visible={visible} onOk={() => form.submit()} confirmLoading={confirmLoading} onCancel={handleCancel}>
      <Form form={form} onFinish={onFinish}>
        <Form.Item label="会员帐号" name="account">
          <span>{state.user.account}</span>
        </Form.Item>
        <Form.Item label="开通种类" name="vipType" initialValue={1}>
          <Select>
            {vipPurchase.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.vipType !== currentValues.vipType}>
          {({ getFieldValue }) => (
            <Form.Item label="开通天数" name="days">
              <span>{vipPurchase.find((item) => item.id === getFieldValue('vipType'))?.days}</span>
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.vipType !== currentValues.vipType}>
          {({ getFieldValue }) => (
            <Form.Item label="支付金额" name="days">
              <span>{vipPurchase.find((item) => item.id === getFieldValue('vipType'))?.price}</span>
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item label="支付方式" name="payRoute" initialValue={PAY_ROUTES[0].payRoute}>
          <Radio.Group>
            {PAY_ROUTES.map((payRoute) => (
              <Radio key={payRoute.payRoute} value={payRoute.payRoute}>
                {payRoute.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BuyVipModal;
