import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

const Share = () => {
  return (
    <Menu>
      <MenuButton>
        Share report
        <IconButton aria-label="Share report" variant="ghost">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4 11C4.55228 11 5 11.4477 5 12V20C5 20.2652 5.10536 20.5196 5.29289 20.7071C5.48043 20.8946 5.73478 21 6 21H18C18.2652 21 18.5196 20.8946 18.7071 20.7071C18.8946 20.5196 19 20.2652 19 20V12C19 11.4477 19.4477 11 20 11C20.5523 11 21 11.4477 21 12V20C21 20.7957 20.6839 21.5587 20.1213 22.1213C19.5587 22.6839 18.7957 23 18 23H6C5.20435 23 4.44129 22.6839 3.87868 22.1213C3.31607 21.5587 3 20.7956 3 20V12C3 11.4477 3.44772 11 4 11Z"
              fill="#2C5282"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.2929 1.29289C11.6834 0.902369 12.3166 0.902369 12.7071 1.29289L16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711C16.3166 7.09763 15.6834 7.09763 15.2929 6.70711L12 3.41421L8.70711 6.70711C8.31658 7.09763 7.68342 7.09763 7.29289 6.70711C6.90237 6.31658 6.90237 5.68342 7.29289 5.29289L11.2929 1.29289Z"
              fill="#2C5282"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 1C12.5523 1 13 1.44772 13 2V15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15V2C11 1.44772 11.4477 1 12 1Z"
              fill="#2C5282"
            />
          </svg>
        </IconButton>
      </MenuButton>
      <MenuList>
        <MenuItem>Email</MenuItem>
        <MenuItem>Facebook</MenuItem>
        <MenuItem>X</MenuItem>
        <MenuItem>Copy Link</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default Share;
