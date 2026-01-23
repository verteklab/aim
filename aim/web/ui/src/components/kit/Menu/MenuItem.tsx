import React from 'react';
import classNames from 'classnames';

import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IMenuItemProps, IMenuItem } from './types';

/**
 * Generate key with id and parentId
 * @param parentId
 * @param id
 */
function generateKeyWithParent(parentId: string | number, id: string | number) {
  return (parentId ? parentId + '.' : '') + id;
}

/**
 * MenuItem
 * active key computed based on tree model (test1.test2.test3)
 * @param name
 * @param id
 * @param children
 * @param onClickOpen
 * @param parentId
 * @param activeItemKey
 */
function MenuItem({
  name,
  id,
  children,
  onClickOpen,
  parentId = '',
  activeItemKey,
}: IMenuItemProps) {
  // Remove image_name="..." from name
  const processedName = React.useMemo(() => {
    if (typeof name === 'string') {
      // Match image_name="..." or image_name='...' and remove it along with surrounding commas and spaces
      return name
        .replace(/,\s*image_name=["'][^"']*["']\s*,?/gi, ',')
        .replace(/,\s*image_name=["'][^"']*["']\s*$/gi, '')
        .replace(/^image_name=["'][^"']*["']\s*,?\s*/gi, '')
        .replace(/,\s*,/g, ',')
        .trim();
    }
    return name;
  }, [name]);

  const { isActive, isOpen } = React.useMemo(() => {
    /*
     * the fastest algorithm to have tree view is to identify the item with it's parent's ids
     *  if we have this type of tree
     *   layer1 -> layer2 -> layer3
     *   if the layer3 is active, the active key will be layer1.layer2.layer3
     *   if the layer2 is active, the active key will be layer1.layer2
     */
    const key = generateKeyWithParent(parentId, id);
    const active = key === activeItemKey || id === activeItemKey;
    const open = activeItemKey.toString().includes(`${key}.`);

    return {
      isActive: active,
      isOpen: open,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItemKey, id, parentId, name]);

  const onClickItem = React.useCallback(
    (event) => {
      event.stopPropagation();
      event.stopPropagation();
      let key = generateKeyWithParent(parentId, id);
      let callbackName = processedName;
      // if the item has children, activate first child
      if (children?.length) {
        key += `.${children[0].id}`;
        const childName = children[0].name;
        callbackName =
          typeof childName === 'string'
            ? childName
                .replace(/,\s*image_name=["'][^"']*["']\s*,?/gi, ',')
                .replace(/,\s*image_name=["'][^"']*["']\s*$/gi, '')
                .replace(/^image_name=["'][^"']*["']\s*,?\s*/gi, '')
                .replace(/,\s*,/g, ',')
                .trim()
            : childName;
      }

      // ensure that clicked item is not active yet
      if (key !== activeItemKey) {
        onClickOpen(key, callbackName);
      }
    },
    [onClickOpen, parentId, id, processedName, children, activeItemKey],
  );

  return (
    <ErrorBoundary>
      <div
        className={classNames({
          MenuItem: true,
          active: isActive,
        })}
        tabIndex={0}
      >
        <div
          className={classNames({
            MenuItemHead: true,
            layer1: !parentId,
            layer2: parentId,
            no_child: !children?.length,
            active: isActive,
            open: isOpen,
          })}
          onClick={onClickItem}
          role='button'
        >
          <div>
            <Text
              size={14}
              tint={isActive ? 100 : 80}
              weight={600}
              color={isActive ? 'info' : 'primary'}
            >
              {processedName}
            </Text>
            {children?.length && (
              <Icon
                name={isOpen || isActive ? 'arrow-up' : 'arrow-down'}
                fontSize={'0.75rem'}
                color={isOpen || isActive ? '#1C2852' : '#414B6D'}
              />
            )}
          </div>
        </div>
        {children?.length && (
          <div
            className={classNames({
              MenuItemBody: true,
              open: isOpen,
            })}
          >
            <div>
              {children?.map((item: IMenuItem) => {
                // Remove image_name="..." from child item name
                const processedChildName =
                  typeof item.name === 'string'
                    ? item.name
                        .replace(/,\s*image_name=["'][^"']*["']\s*,?/gi, ',')
                        .replace(/,\s*image_name=["'][^"']*["']\s*$/gi, '')
                        .replace(/^image_name=["'][^"']*["']\s*,?\s*/gi, '')
                        .replace(/,\s*,/g, ',')
                        .trim()
                    : item.name;
                return (
                  <MenuItem
                    key={item.id}
                    {...item}
                    name={processedChildName}
                    onClickOpen={onClickOpen}
                    parentId={generateKeyWithParent(parentId, id)}
                    activeItemKey={activeItemKey}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default React.memo<IMenuItemProps>(MenuItem);
